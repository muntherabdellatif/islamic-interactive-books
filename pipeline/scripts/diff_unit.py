"""Diff two blind transcription passes for a page range and emit the disagreements.

Usage: python3 diff_unit.py <passA-dir> <passB-dir> <first> <last> [--json out.json]

Tatweel and spacing around guillemets are normalised away (spec rule 8), so only
genuine disagreements remain: word differences, diacritic differences and line-count
mismatches. Prints a per-page table and the differing lines.
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compare_transcriptions import load_lines, strip_marks  # noqa: E402

TATWEEL_RE = re.compile("ـ")
QUOTE_SPACE_RE = re.compile(r"([«“]) +| +([»”])")
SPACE_RE = re.compile(r"\s+")


def normalise(text: str) -> str:
    text = TATWEEL_RE.sub("", text)
    text = QUOTE_SPACE_RE.sub(lambda m: m.group(1) or m.group(2), text)
    return SPACE_RE.sub(" ", text).strip()


def diff_page(a_path: Path, b_path: Path) -> dict[str, object]:
    a = {n: normalise(t) for n, t in load_lines(a_path).items()}
    b = {n: normalise(t) for n, t in load_lines(b_path).items()}
    diffs = []
    spacing_only = 0
    for n in sorted(set(a) | set(b)):
        ta, tb = a.get(n, ""), b.get(n, "")
        if ta == tb:
            continue
        if ta.replace(" ", "") == tb.replace(" ", ""):
            spacing_only += 1  # tight justification makes word gaps ambiguous: auto-resolved
            continue
        kind = "diacritics" if strip_marks(ta) == strip_marks(tb) else "words"
        diffs.append({"line": n, "kind": kind, "A": ta, "B": tb})
    total = max(len(a), len(b)) or 1
    return {
        "lines_a": len(a), "lines_b": len(b), "line_count_match": len(a) == len(b),
        "differing_lines": diffs,
        "spacing_only_lines": spacing_only,
        "agreement_pct": round(100 * (total - len(diffs)) / total, 1),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pass_a", type=Path)
    parser.add_argument("pass_b", type=Path)
    parser.add_argument("first", type=int)
    parser.add_argument("last", type=int)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    result: dict[str, dict[str, object]] = {}
    for page in range(args.first, args.last + 1):
        a_file, b_file = args.pass_a / f"{page}.html", args.pass_b / f"{page}.html"
        if not (a_file.exists() and b_file.exists()):
            print(f"page {page}: MISSING {'A' if not a_file.exists() else ''}{'B' if not b_file.exists() else ''}")
            continue
        info = diff_page(a_file, b_file)
        result[str(page)] = info
        flag = "" if info["line_count_match"] else "  LINE COUNT MISMATCH"
        print(f"page {page}: A={info['lines_a']} B={info['lines_b']} "
              f"diff-lines={len(info['differing_lines'])} spacing-only={info['spacing_only_lines']} agreement={info['agreement_pct']}%{flag}")
        for d in info["differing_lines"]:
            print(f"   L{d['line']} [{d['kind']}]\n     A: {d['A']}\n     B: {d['B']}")
    if args.json:
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
