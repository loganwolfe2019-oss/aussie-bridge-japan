# Aussie Bridge Japan

A little toolkit for keeping one foot in Australia and one in Japan.

## What's in here

- [`tools/Get-BridgeTime.ps1`](tools/Get-BridgeTime.ps1) — shows the current time in Sydney and Tokyo, and how many hours apart they are right now.

## Usage

From PowerShell, run:

```powershell
.\tools\Get-BridgeTime.ps1
```

Example output:

```text
City   Local time UTC offset
----   ---------- ----------
Sydney Sun 17:34  10:00:00
Tokyo  Sun 16:34  09:00:00

Sydney is 1 hour(s) ahead of Tokyo right now.
```

The gap changes with daylight saving: Sydney is 2 hours ahead of Tokyo during AEDT (roughly October–April) and 1 hour ahead the rest of the year. Japan does not observe daylight saving.

## Requirements

- Windows with PowerShell 5.1 or later (no extra modules needed).
