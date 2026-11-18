"""Line-by-line diff of two transcriptions of the same page.

Usage: python3 compare_transcriptions.py <a.html> <b.html>
Reports line-count mismatch, word-level disagreements (diacritics stripped) and
diacritic-only disagreements separately. Exit code 0 always; read the report.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_page_html import PageParser  # noqa: E402

DIACRITICS_RE = re.compile(r"[ً-ْٰـ]")
TAGS_RE = re.compile(r"\s+")


def load_lines(path: Path) -> dict[int, str]:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return {n: TAGS_RE.sub(" ", t).strip() for n, t in parser.line_text.items()}


def strip_marks(text: str) -> str:
    return DIACRITICS_RE.sub("", text)


def compare(a_path: Path, b_path: Path) -> int:
    a, b = load_lines(a_path), load_lines(b_path)
    print(f"lines: {a_path.name}={len(a)} {b_path.name}={len(b)}"
          + ("" if len(a) == len(b) else "  <-- LINE COUNT MISMATCH"))
    word_diffs = mark_diffs = 0
    for n in sorted(set(a) | set(b)):
        ta, tb = a.get(n, ""), b.get(n, "")
        if ta == tb:
            continue
        if strip_marks(ta) == strip_marks(tb):
            mark_diffs += 1
            print(f"L{n} DIACRITICS-ONLY\n  A: {ta}\n  B: {tb}")
        else:
            word_diffs += 1
            wa, wb = strip_marks(ta).split(), strip_marks(tb).split()
            only_a = [w for w in wa if w not in wb]
            only_b = [w for w in wb if w not in wa]
            print(f"L{n} WORDS  only-A={only_a} only-B={only_b}\n  A: {ta}\n  B: {tb}")
    total = max(len(a), len(b)) or 1
    print(f"SUMMARY lines={total} word-diff-lines={word_diffs} diacritic-only-lines={mark_diffs}"
          f" agreement={100 * (total - word_diffs - mark_diffs) / total:.1f}%")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(compare(Path(sys.argv[1]), Path(sys.argv[2])))
