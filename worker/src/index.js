// ABJ CRM — Cloudflare Worker: serves the CRM app and its API.
// Public surface: POST /api/lead (website form intake) only.
// Everything else under /api/ requires the request to have passed
// Cloudflare Access (Cf-Access-Jwt-Assertion header is present only
// when Access has authenticated the visitor; before Access is set up
// the API fails closed with 401).

import { EmailMessage } from "cloudflare:email";

function buildMime(from, to, subject, body) {
  const safeSubject = subject.replace(/[\r\n]/g, ' ');
  return [
    `From: Aussie Bridge Japan <${from}>`,
    `To: ${to}`,
    `Subject: ${safeSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@aussiebridgejapan.com>`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    body,
  ].join('\r\n');
}

// ---- outbound nurture sequence (sent to the lead, via Brevo) ----
const SITE = 'https://www.aussiebridgejapan.com';

const NURTURE_EMAILS = [
  null, // 1-indexed; step 0 unused
  {
    delayDays: 0,
    subject: "We've got your message",
    body: (l) => `Hi ${l.contact || 'there'},

Thanks for reaching out about ${l.brand}. I'll personally look over what you've sent and get back to you within one business day.

In the meantime, if you're curious what a realistic first year in Japan actually looks like, I wrote about it here:
${SITE}/blog/first-year-selling-in-japan.html

No sugar-coating — Japan rewards patience, and I'd rather you know that going in.

Talk soon,
Founder, Aussie Bridge Japan
aussiebridgejapan@outlook.com`,
  },
  {
    delayDays: 3,
    subject: "Why Japan, why now",
    body: (l) => `Hi ${l.contact || 'there'},

Following up briefly on ${l.brand}'s potential in Japan.

A lot of the brands I talk to are surprised by how much timing is on their side right now — JAEPA import duty advantages, a craft category still finding its feet here, and Japanese consumers actively looking for exactly this kind of product.

Here's why the window is open:
${SITE}/blog/japan-most-exciting-market.html

Happy to jump on a quick call whenever suits — grab a time here:
${SITE}/book-consultation.html

Founder, Aussie Bridge Japan`,
  },
  {
    delayDays: 10,
    subject: "What Japanese buyers actually care about",
    body: (l) => `Hi ${l.contact || 'there'},

Something I find most Australian brands don't expect: Japanese hospitality buyers care more about your story and consistency than your price.

Here's what actually matters to them:
${SITE}/blog/japanese-hospitality-buyers.html

Worth a read before your first conversation with a distributor, whoever you end up working with.

Founder, Aussie Bridge Japan`,
  },
  {
    delayDays: 21,
    subject: "Door's open whenever you're ready",
    body: (l) => `Hi ${l.contact || 'there'},

I won't keep filling your inbox — this is my last note for now.

If the timing isn't right yet for ${l.brand}, that's completely fine; Japan isn't going anywhere. If anything changes, just reply to this email and it comes straight to me.

Wishing you well either way.

Founder, Aussie Bridge Japan`,
  },
];

async function sendBrevoEmail(env, toEmail, toName, subject, textContent) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Aussie Bridge Japan', email: 'leads@aussiebridgejapan.com' },
      to: [{ email: toEmail, name: toName || undefined }],
      subject,
      textContent,
    }),
  });
  if (!res.ok) throw new Error('brevo send failed: ' + res.status);
}

async function sendNurtureStep(env, lead, step) {
  if (!lead.email) return;
  const email = NURTURE_EMAILS[step];
  if (!email) return;
  try {
    await sendBrevoEmail(env, lead.email, lead.contact, email.subject, email.body(lead));
    await env.DB.prepare('UPDATE leads SET nurture_step = ?2 WHERE id = ?1').bind(lead.id, step).run();
  } catch (e) {
    // Leave nurture_step unchanged so the next scheduled run retries.
  }
}

async function runNurtureSweep(env) {
  const rows = (await env.DB.prepare(
    `SELECT id, brand, contact, email, created, nurture_step FROM leads
     WHERE email != '' AND source LIKE 'website%' AND nurture_step BETWEEN 1 AND 3
       AND stage NOT IN ('Signed', 'Lost')`
  ).all()).results;

  const now = Date.now();
  for (const lead of rows) {
    const ageDays = (now - new Date(lead.created).getTime()) / 86400000;
    const nextStep = lead.nurture_step + 1;
    const target = NURTURE_EMAILS[nextStep];
    if (target && ageDays >= target.delayDays) {
      await sendNurtureStep(env, lead, nextStep);
    }
  }
}

async function notifyNewLead(env, lead) {
  try {
    const lines = [
      `New lead from the website.`,
      ``,
      `Brand/Company: ${lead.brand}`,
      lead.contact ? `Contact: ${lead.contact}` : null,
      lead.email ? `Email: ${lead.email}` : null,
      lead.phone ? `Phone: ${lead.phone}` : null,
      `Category: ${lead.category}`,
      lead.notes ? `` : null,
      lead.notes ? `Message:` : null,
      lead.notes || null,
      ``,
      `View in the CRM: https://crm.aussiebridgejapan.com/`,
    ].filter(l => l !== null).join('\r\n');

    const mime = buildMime(
      'leads@aussiebridgejapan.com',
      'aussiebridgejapan@outlook.com',
      `New lead: ${lead.brand}`,
      lines
    );
    const msg = new EmailMessage('leads@aussiebridgejapan.com', 'aussiebridgejapan@outlook.com', mime);
    await env.SEND_EMAIL.send(msg);
  } catch (e) {
    // Never let a notification failure break lead intake.
  }
}

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
  async fetch(request, env, ctx) {
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
    // Excluded from Access at the edge via the "Lead Intake public" app
    // (destination crm.aussiebridgejapan.com/api/lead, policy: bypass/everyone).
    if (path === '/api/lead') {
      if (method !== 'POST') return json({ error: 'method not allowed' }, 405, request);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'invalid json' }, 400, request); }
      if (b.website) return json({ ok: true }, 200, request); // honeypot field: silently accept spam
      const brand = s(b.company || b.brand, 200);
      const name = s(b.name, 200);
      if (!brand && !name) return json({ error: 'missing name/company' }, 400, request);
      const now = new Date().toISOString();
      const leadId = uid();
      const leadRow = { brand: brand || name, contact: name, email: s(b.email, 200), phone: s(b.phone, 50),
             category: s(b.category, 60) || 'Other', notes: s(b.message, 4000) };
      await env.DB.prepare(
        `INSERT INTO leads (id, brand, contact, email, phone, category, stage, value, city, notes, source, created, updated)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'New Lead', 0, '', ?7, ?8, ?9, ?9)`
      ).bind(leadId, leadRow.brand, leadRow.contact, leadRow.email, leadRow.phone,
             leadRow.category, leadRow.notes, s(b.source, 60) || 'website', now).run();
      ctx.waitUntil(notifyNewLead(env, leadRow));
      ctx.waitUntil(sendNurtureStep(env, { ...leadRow, id: leadId }, 1));
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

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runNurtureSweep(env));
  },
};
