# Adjudication report: tuhfat-unit-03 (pages 21-29)

Content: ijaza/sanad prose (pp. 21-27) and bibliography "المصادر والمراجع" (pp. 28-29).

| Page | Lines | Substantively differing | Spacing-only | Decisions (A/B/third) | Agreement before (JSON) | Uncertain remaining | Verdict |
|---|---|---|---|---|---|---|---|
| 21 | 27 | 14 | 1 | A: 10, B: 1, merge/third: 3 | 48.1% | 2 (pre-existing, unchanged) | ✅ |
| 22 | 23 | 15 | 0 | A: 6, B: 9 | 34.8% | 0 | ✅ |
| 23 | 21 | 17 | 0 | A: 9, B: 7, merge: 1 | 19.0% | 0 | ✅ |
| 24 | 24 | 10 | 0 | A: 2, B: 8 | 58.3% | 0 | ✅ |
| 25 | 22 | 2 | 3 | B: 2 | 90.9% | 0 | ✅ |
| 26 | 21 | 3 | 5 | A: 2, B: 1 | 85.7% | 0 | ✅ |
| 27 | 10 | 0 | 2 | — (no substantive diffs) | 100.0% | 0 | ✅ |
| 28 | 22 | 4 | 8 | A: 2, B/merge: 2 | 81.8% | 0 | ✅ |
| 29 | 7 | 3 | 0 | A: 2, resolved: 1 (uncertain lifted) | 57.1% | 0 | ✅ |

All 9 pages pass `validate_page_html.py`. No page has a line-count mismatch.

## Method notes
- `crop_lines.py` failed on several pages (pitch mis-estimation on long ijaza pages, `Coordinate 'lower' is less than 'upper'`); fell back to `crop_page.py --strips 8 --scale 1.6` throughout, with additional manual Python crops/zooms on specific words when the strip resolution wasn't enough to distinguish a hamza seat, a dotted letter (ض vs ص), or a shadda+fatha combination.
- The three-rosette ornament (pp. 21, 22, 23×3, 24) was confirmed against the image each time and transcribed as `❀ ❀ ❀` (pass A's choice), never pass B's `٭ ٭ ٭`.
- Found and removed stray tatweel (U+0640) characters that had crept into several of pass A's lines (pp. 22, 23, 24, 26) — these are never copied per spec §8. The `هـ` hijri-year abbreviation's own tatweel was left untouched (conventional glyph, not word elongation).
- Diacritic-only differences (shadda vs shadda+fatha, kasra vs tanween, dagger-alif `ىٰ` vs plain `ى` for `على`) were resolved line-by-line from the zoomed scan; no systematic preference for either pass held up — pass A was more often right that `على` as a standalone preposition keeps the dagger alif where pass B had flattened it to plain `على`, but pass B was more often right on preposition vowelling (`عَنِ` before `ال-`, `وَحَسَنِ` in a genitive list) and on several nisba/name spellings.

## Notable / non-routine decisions
- p.23 L11: pass A's `النَّضْرِ` (ض) vs pass B's `النَّصْرِ` (ص) — zoomed to the dot and confirmed ض (A correct).
- p.22 L18: pass A's "بحضر باليمن" vs pass B's "بحضرموت باليمن" — image confirms B; A had dropped "موت" from Hadramawt.
- p.28 L4: both passes' "لسيلمان" reading double-checked against the image — the print itself has the ي/ل transposed (a printer's typo for "سليمان"); kept as printed per spec §5 (no silent correction).
- p.29 L1: `<span class="uncertain">الضباء</span>` from pass A lifted — image clearly reads "الضباع" (a known shaykh's name, al-Dabbaʿ), no longer uncertain.
- p.21 L1: neither pass exactly matched the image for "المُتَوَلِّي" (shadda on lam present, no shadda on final ي, single ي); went with that third reading over either pass's.
