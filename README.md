# Platinum Hunt — Leonida — GTA 6 Trophy Guide

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/astiip/gta6-trophy-guide-01-bot/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/astiip/gta6-trophy-guide-01-bot/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline tracker and guide for all 55 PlayStation 5 trophies of Grand Theft
Auto VI: a warm-cream hunt board with a horizontal 7-stage roadmap, an honest
audit strip, a two-column checklist + detail panel, per-trophy counters, a
spoiler setting, and export/import of your progress. Every guide is written in
our own words and every step cites its source — unconfirmed trophies say so
plainly instead of inventing steps.

## How it works

1. **Hunt board** — the header shows your progress (X / 55 earned) with a
   bar; the roadmap rail has 7 stage chips (S1 Chapter 1 through S7 100% +
   Platinum), each showing its earned count; click a chip to filter the list.
2. **Audit strip** — computed live from the data: 55 official, 1P 2G 6S 46B,
   28 hidden, guides and steps that cite a source, 6 sources read 20 Nov
   2026, 1 possibly missable, watch / unconfirmed / disagree counts.
3. **Checklist + detail** — the left column groups trophies by stage with
   grade pills and flags (MISSABLE, WATCH, UNCONFIRMED, SOURCES DISAGREE,
   1 SOURCE); the right panel shows the selected trophy's official
   description, a one-line summary, numbered steps with citation markers
   like [1], and a YOUR COUNT widget for counting trophies.
4. **Spoilers** — story trophies stay hidden ("Hidden trophy — reveal")
   until earned or until you turn spoilers on.
5. **Saved** — progress and counters live in localStorage; Export / Import
   moves them as JSON.

## Honesty notes

- Only **Positive Mental Attitude** is flagged possibly missable (the
  Chapter 1 balcony meditation may be lost after Chapter 1; whether it is
  required is still unconfirmed).
- **Fair Game, Bad Luck I Guess, The Truth Is Out There, Ten Pin** have no
  confirmed method — the guide says so and writes no invented steps.
- **In The Beginning…** and **Capital Offense** are reported by one source
  only (PowerPyx), not yet confirmed by a second source.
- Where sources disagree (the final mission's chapter, the 18 vs 15
  meditation count, the bowling wording), both versions are shown.

## Sources

- [0] Official list — the 55 trophies as shipped in the kit
- [1] PowerPyx — GTA 6 Trophy Guide & Roadmap
- [2] KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap
- [3] eGamers — GTA 6 Trophy List: All 55 Trophies And Achievements
- [4] GTA-Zone — GTA 6 Trophy List: All 55 Trophies and Achievements
- [5] GTA Vibes — GTA 6 Trophy List: All 55 Trophies and Achievements

OutputLag is deliberately not cited: its trophy page URL could not be
verified. Every step is our own wording of what the source says — sources
are cited, never copied.

## Files

- `app/index.html`, `app/style.css` — the hunt board page.
- `app/app.js` — wires the tracker: roadmap, filters, audit strip, detail
  panel, counters, spoilers, localStorage, export/import.
- `app/data/trophies.json` — the 55 trophies with official names,
  descriptions and grades, plus kind, stage, count, flags, and cited steps.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json`.

The app is plain static files under `app/` — no network request, no build
step, no external font or image. Serve it with `node serve.ts` and open
http://localhost:8080.
