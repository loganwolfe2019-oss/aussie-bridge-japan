// ABJ CRM — Cloudflare Worker: serves the CRM app and its API.
// Public surface: POST /api/lead (website form intake) only.
// Everything else under /api/ requires the request to have passed
// Cloudflare Access (Cf-Access-Jwt-Assertion header is present only
// when Access has authenticated the visitor; before Access is set up
// the API fails closed with 401).

const ALLOWED_ORIGINS = [
  'https://loganwolfe2019-oss.github.io',
  'https://www.aussiebridgejapan.com',
  'https://aussiebridgejapan.com',
  'https://crm.aussiebridgejapan.com',
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

const s = (v, max) => (v == null ? '' : String(v)).slice(0, max || 500).trim();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // ---- public: lead intake from the website forms ----
    if (path === '/api/lead') {
      if (method !== 'POST') return json({ error: 'method not allowed' }, 405, request);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'invalid json' }, 400, request); }
      if (b.website) return json({ ok: true }, 200, request); // honeypot field: silently accept spam
      const brand = s(b.company || b.brand, 200);
      const name = s(b.name, 200);
      if (!brand && !name) return json({ error: 'missing name/company' }, 400, request);
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO leads (id, brand, contact, email, phone, category, stage, value, city, notes, source, created, updated)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'New Lead', 0, '', ?7, ?8, ?9, ?9)`
      ).bind(uid(), brand || name, name, s(b.email, 200), s(b.phone, 50),
             s(b.category, 60) || 'Other', s(b.message, 4000), s(b.source, 60) || 'website', now).run();
      return json({ ok: true }, 200, request);
    }

    // ---- everything else requires Cloudflare Access ----
    if (!request.headers.get('Cf-Access-Jwt-Assertion')) {
      return json({ error: 'unauthorized' }, 401, request);
    }

    try {
      // GET /api/state — full CRM state in one call
      if (path === '/api/state' && method === 'GET') {
        const leads = (await env.DB.prepare('SELECT * FROM leads ORDER BY created DESC').all()).results;
        const tasks = (await env.DB.prepare('SELECT * FROM tasks ORDER BY created DESC').all()).results;
        return json({ leads, tasks }, 200, request);
      }

      // POST /api/leads — create lead from CRM
      if (path === '/api/leads' && method === 'POST') {
        const b = await request.json();
        const now = new Date().toISOString();
        const id = uid();
        await env.DB.prepare(
          `INSERT INTO leads (id, brand, contact, email, phone, category, stage, value, city, notes, source, created, updated)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,'manual',?11,?11)`
        ).bind(id, s(b.brand, 200), s(b.contact, 200), s(b.email, 200), s(b.phone, 50),
               s(b.category, 60), s(b.stage, 40) || 'New Lead', Number(b.value) || 0,
               s(b.city, 60), s(b.notes, 4000), now).run();
        return json({ ok: true, id }, 200, request);
      }

      // PUT/DELETE /api/leads/:id
      const leadMatch = path.match(/^\/api\/leads\/([A-Za-z0-9]+)$/);
      if (leadMatch && method === 'PUT') {
        const b = await request.json();
        await env.DB.prepare(
          `UPDATE leads SET brand=?2, contact=?3, email=?4, phone=?5, category=?6, stage=?7, value=?8, city=?9, notes=?10, updated=?11 WHERE id=?1`
        ).bind(leadMatch[1], s(b.brand, 200), s(b.contact, 200), s(b.email, 200), s(b.phone, 50),
               s(b.category, 60), s(b.stage, 40), Number(b.value) || 0, s(b.city, 60),
               s(b.notes, 4000), new Date().toISOString()).run();
        return json({ ok: true }, 200, request);
      }
      if (leadMatch && method === 'DELETE') {
        await env.DB.prepare('DELETE FROM leads WHERE id=?1').bind(leadMatch[1]).run();
        await env.DB.prepare(`UPDATE tasks SET leadId='' WHERE leadId=?1`).bind(leadMatch[1]).run();
        return json({ ok: true }, 200, request);
      }

      // POST /api/tasks
      if (path === '/api/tasks' && method === 'POST') {
        const b = await request.json();
        const id = uid();
        await env.DB.prepare(
          `INSERT INTO tasks (id, title, due, leadId, done, created) VALUES (?1,?2,?3,?4,0,?5)`
        ).bind(id, s(b.title, 500), s(b.due, 20), s(b.leadId, 40), new Date().toISOString()).run();
        return json({ ok: true, id }, 200, request);
      }

      // PUT/DELETE /api/tasks/:id
      const taskMatch = path.match(/^\/api\/tasks\/([A-Za-z0-9]+)$/);
      if (taskMatch && method === 'PUT') {
        const b = await request.json();
        await env.DB.prepare('UPDATE tasks SET done=?2 WHERE id=?1')
          .bind(taskMatch[1], b.done ? 1 : 0).run();
        return json({ ok: true }, 200, request);
      }
      if (taskMatch && method === 'DELETE') {
        await env.DB.prepare('DELETE FROM tasks WHERE id=?1').bind(taskMatch[1]).run();
        return json({ ok: true }, 200, request);
      }

      // POST /api/import — replace all data with a JSON backup
      if (path === '/api/import' && method === 'POST') {
        const b = await request.json();
        if (!Array.isArray(b.leads) || !Array.isArray(b.tasks)) return json({ error: 'bad backup shape' }, 400, request);
        const now = new Date().toISOString();
        const stmts = [
          env.DB.prepare('DELETE FROM leads'),
          env.DB.prepare('DELETE FROM tasks'),
        ];
        for (const l of b.leads.slice(0, 5000)) {
          stmts.push(env.DB.prepare(
            `INSERT INTO leads (id, brand, contact, email, phone, category, stage, value, city, notes, source, created, updated)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`
          ).bind(s(l.id, 40) || uid(), s(l.brand, 200), s(l.contact, 200), s(l.email, 200), s(l.phone, 50),
                 s(l.category, 60), s(l.stage, 40) || 'New Lead', Number(l.value) || 0, s(l.city, 60),
                 s(l.notes, 4000), s(l.source, 60) || 'import', s(l.created, 40) || now, s(l.updated, 40) || now));
        }
        for (const t of b.tasks.slice(0, 5000)) {
          stmts.push(env.DB.prepare(
            `INSERT INTO tasks (id, title, due, leadId, done, created) VALUES (?1,?2,?3,?4,?5,?6)`
          ).bind(s(t.id, 40) || uid(), s(t.title, 500), s(t.due, 20), s(t.leadId, 40), t.done ? 1 : 0, s(t.created, 40) || now));
        }
        await env.DB.batch(stmts);
        return json({ ok: true, leads: b.leads.length, tasks: b.tasks.length }, 200, request);
      }

      return json({ error: 'not found' }, 404, request);
    } catch (e) {
      return json({ error: 'server error' }, 500, request);
    }
  },
};
