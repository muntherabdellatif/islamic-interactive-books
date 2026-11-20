"""Structural validator for stage-1 page HTML (see pipeline/html-transcription-spec.md).

Usage: python3 validate_page_html.py <file.html> [...]
Exit code 0 when every file passes; problems are printed per file.
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

BLOCK_ID_RE = re.compile(r"^p(\d{4})-([bf])(\d{2})$")
BLOCK_CLASSES = {
    "chapter-title", "section-title", "book-paragraph", "sanad-block",
    "poem-bayt", "footnote", "page-note",
}
VOID_TAGS = {"br", "img", "hr", "meta", "link", "input"}


def printed_location(path: Path, page: int, pages_json: Path | None = None) -> tuple[int, int]:
    # default: data/books/<book>/html/<N>.html -> data/books/<book>/pages.json
    if pages_json is None:
        pages_json = path.resolve().parents[1] / "pages.json"
    if not pages_json.exists():
        return 1, page  # single-volume book: printed page == image number
    volumes = json.loads(pages_json.read_text(encoding="utf-8"))["volumes"]
    for vol in volumes:
        if vol["first_image"] <= page <= vol["last_image"]:
            return vol["volume"], page - vol["image_offset"]
    raise ValueError(f"image {page} is outside every volume in pages.json")


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.errors: list[str] = []
        self.articles: list[dict[str, str]] = []
        self.block_ids: list[str] = []
        self.lines: list[int] = []
        self.line_text: dict[int, str] = {}
        self.current_line: int | None = None
        self.line_depth = 0
        self.in_block = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: (v or "") for k, v in attrs}
        classes = set(attr.get("class", "").split())
        if tag not in VOID_TAGS:
            self.stack.append(tag)
        if tag == "article":
            self.articles.append(attr)
        if classes & BLOCK_CLASSES:
            if "data-block-id" not in attr:
                self.errors.append(f"<{tag} class={attr.get('class')}> missing data-block-id")
            else:
                self.block_ids.append(attr["data-block-id"])
        if "line" in classes:
            if self.current_line is not None:
                self.errors.append("nested span.line")
            raw = attr.get("data-line", "")
            if not raw.isdigit():
                self.errors.append(f"span.line with bad data-line={raw!r}")
                return
            self.current_line = int(raw)
            self.line_depth = len(self.stack)
            self.lines.append(self.current_line)
            self.line_text[self.current_line] = ""

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS:
            return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f"unbalanced </{tag}> (open: {self.stack[-3:]})")
            if tag in self.stack:
                while self.stack and self.stack.pop() != tag:
                    pass
            return
        if self.current_line is not None and len(self.stack) == self.line_depth:
            self.current_line = None
        self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.current_line is not None:
            self.line_text[self.current_line] += data
        elif data.strip() and self.stack and self.stack[-1] not in {"span", "header"}:
            if any(t in self.stack for t in ("section", "footer")):
                self.errors.append(f"text outside span.line: {data.strip()[:40]!r}")


def validate(path: Path, pages_json: Path | None = None) -> list[str]:
    try:
        page = int(path.stem)
    except ValueError:
        return [f"file name must be <image-number>.html"]
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    errors = list(parser.errors)
    if parser.stack:
        errors.append(f"unclosed tags: {parser.stack}")
    if len(parser.articles) != 1:
        return errors + [f"expected exactly one <article>, found {len(parser.articles)}"]
    art = parser.articles[0]
    vol, printed = printed_location(path, page, pages_json)
    expected = {"data-page": str(page), "data-printed-vol": str(vol),
                "data-printed-page": str(printed), "dir": "rtl", "lang": "ar"}
    for key, value in expected.items():
        if art.get(key) != value:
            errors.append(f"article {key}={art.get(key)!r}, expected {value!r}")
    blank = art.get("data-blank") == "true"
    if not blank and not parser.lines:
        errors.append("no span.line found (mark data-blank=\"true\" for empty pages)")
    if parser.lines != list(range(1, len(parser.lines) + 1)):
        errors.append(f"data-line not sequential from 1: {parser.lines}")
    for n, text in parser.line_text.items():
        if not text.strip():
            errors.append(f"line {n} is empty")
    if len(set(parser.block_ids)) != len(parser.block_ids):
        errors.append("duplicate data-block-id")
    for bid in parser.block_ids:
        m = BLOCK_ID_RE.match(bid)
        if not m or int(m.group(1)) != page:
            errors.append(f"bad data-block-id {bid!r} (expected p{page:04d}-b01 style)")
    return errors


def main(argv: list[str]) -> int:
    pages_json = None
    if argv and argv[0] == "--book":
        pages_json = Path(__file__).resolve().parents[2] / "data/books" / argv[1] / "pages.json"
        argv = argv[2:]
    failed = 0
    for arg in argv:
        path = Path(arg)
        try:
            errors = validate(path, pages_json)
        except (OSError, ValueError) as err:
            errors = [str(err)]
        if errors:
            failed += 1
            print(f"FAIL {path}")
            for err in errors:
                print(f"  - {err}")
        else:
            print(f"ok   {path}")
    print(f"{len(argv) - failed}/{len(argv)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
