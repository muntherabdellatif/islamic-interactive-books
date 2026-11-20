# Islamic Interactive Books — agent quick index

Pipeline: classical Arabic book scans → interactive HTML. Active book: Tuhfat al-Atfal (al-Jamzuri), 29 pages — al-Nashr (985 pages) is intentionally paused, see `pipeline/status.md`. Read this file first; do NOT scan the repo.

## Where things are (open only what the task needs)
| Need | File |
|---|---|
| Current progress, next steps | `pipeline/status.md` |
| Stage-1 HTML rules (binding) | `pipeline/html-transcription-spec.md` |
| Per-agent task instructions | `pipeline/agent-tasks/transcriber.md`, `adjudicator.md` |
| Tools | `pipeline/scripts/` (`crop_page.py`, `crop_lines.py`, `validate_page_html.py`, `diff_unit.py`) |
| Viewer (scan vs HTML) | `review/index.html` + `review/page-style.css` (`python3 -m http.server`, `/review/?page=N`) |
| Vision | `about.md`; pipeline stages: `pipeline.md`; layout: `structure.md` |

## Never read (large, not needed to work)
`data/books/*/pdf/`, `raw-data/`, `formatted-data/`, `source/`, `mapper.json`. Use scripts. Scans (`images/*.webp`) are viewed only through crops from `crop_page.py` / `crop_lines.py`.

## Token rules
- Delegate to subagents with a task file + parameters; do not paste long instructions.
- Agent final replies: at most 6 lines; details go into `pipeline/reviews/*.md`.
- Never print or re-read whole HTML pages to verify: run `validate_page_html.py` and `diff_unit.py`.
- State lives in the repo (`pipeline/status.md`), not in chat: a fresh session can resume from it.
