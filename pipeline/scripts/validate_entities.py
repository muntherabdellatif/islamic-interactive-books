#!/usr/bin/env python
"""Validate data/books/<BOOK>/entities.json (stage 2) against html and internal invariants."""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

TASHKEEL = re.compile(r"[ً-ٰٟۖ-ۭ]")
TAG = re.compile(r"<[^>]+>")
BOOK_DIR = Path(__file__).resolve().parents[2] / "data" / "books"


def strip_tashkeel(text: str) -> str:
    return TASHKEEL.sub("", text)


def normalize(text: str) -> str:
    return unicodedata.normalize("NFC", strip_tashkeel(text))


def load_html_lines(book: str, page: int) -> dict:
    """block_id -> {line_no: plain_text}, sliced between consecutive data-block-id markers."""
    path = BOOK_DIR / book / "html" / f"{page}.html"
    if not path.exists():
        return None
    raw = path.read_text(encoding="utf-8")
    block_marks = list(re.finditer(r'data-block-id="([^"]+)"', raw))
    blocks = {}
    for idx, bm in enumerate(block_marks):
        block_id = bm.group(1)
        start = bm.end()
        end = block_marks[idx + 1].start() if idx + 1 < len(block_marks) else len(raw)
        chunk = raw[start:end]
        line_marks = list(re.finditer(r'data-line="(\d+)">', chunk))
        lines = {}
        for j, lm in enumerate(line_marks):
            line_no = lm.group(1)
            s = lm.end()
            e = line_marks[j + 1].start() if j + 1 < len(line_marks) else len(chunk)
            text = TAG.sub("", chunk[s:e])
            text = text.split("<", 1)[0]  # discard a trailing unclosed tag bled in from the next block
            lines[line_no] = normalize(text)
        blocks[block_id] = lines
    return blocks


def normalize_alif(letter: str) -> str:
    """أ/إ/آ وأخواتها تُعامل كحرف الألف لغايات تحليل مرموز الحروف (اسم الحرف، لا هيئة الهمزة)."""
    return "ا" if letter in "أإآ" else letter


def decode_all_letters(phrase: str) -> list:
    cleaned = strip_tashkeel(phrase)
    cleaned = re.sub(r"[^؀-ۿ]", "", cleaned)
    return [normalize_alif(c) for c in cleaned]


def decode_first_letter_of_word(phrase: str) -> list:
    words = strip_tashkeel(phrase).split()
    out = []
    for w in words:
        w = re.sub(r"[^؀-ۿ]", "", w)
        if w:
            out.append(normalize_alif(w[0]))
    return out


def decode_all_letters_except_alif(phrase: str) -> list:
    return [c for c in decode_all_letters(phrase) if c != "ا"]


WESTERN_TO_ARABIC_DIGITS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")


def arabic_num(n: int) -> str:
    return str(n).translate(WESTERN_TO_ARABIC_DIGITS)


ALPHABET_28 = set("ابتثجحخدذرزسشصضطظعغفقكلمنهوي")


def to_alphabet_set(letters: list) -> set:
    return {"ا" if c == "ء" else c for c in letters}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--book", required=True)
    args = ap.parse_args()

    entities_path = BOOK_DIR / args.book / "entities.json"
    data = json.loads(entities_path.read_text(encoding="utf-8"))
    entities = data["entities"]

    errors = []
    warnings = []
    by_id = {}
    for e in entities:
        if e["id"] in by_id:
            errors.append(f"id مكرر: {e['id']}")
        by_id[e["id"]] = e

    html_cache = {}

    def get_block(page, block_id):
        key = (args.book, page)
        if key not in html_cache:
            html_cache[key] = load_html_lines(args.book, page)
        blocks = html_cache[key]
        if blocks is None:
            return None
        return blocks.get(block_id)

    # 1. anchors resolve + quote substring check
    for e in entities:
        for a in e.get("anchors", []):
            page, block_id = a["page"], a["block_id"]
            lines = get_block(page, block_id)
            if lines is None:
                errors.append(f"{e['id']}: صفحة {page} غير موجودة في html/")
                continue
            if "line" in a:
                line_text = lines.get(str(a["line"]))
                if line_text is None:
                    errors.append(f"{e['id']}: لا يوجد data-line={a['line']} في {block_id} (صفحة {page})")
                    continue
            else:
                line_text = " ".join(lines.values())
                if not lines:
                    errors.append(f"{e['id']}: block_id={block_id} غير موجود في صفحة {page}")
                    continue
            quote = a.get("quote")
            if quote:
                q = normalize(quote)
                occurrence = a.get("occurrence", 1)
                count = line_text.count(q)
                if count == 0:
                    errors.append(f"{e['id']}: quote «{quote}» غير موجود حرفياً في {block_id}/{a.get('line')}")
                elif count > 1 and "occurrence" not in a:
                    errors.append(f"{e['id']}: quote «{quote}» يتكرر {count} مرات في نفس السطر بلا occurrence محدد")
                elif occurrence > count:
                    errors.append(f"{e['id']}: occurrence={occurrence} لكن quote تكرر فقط {count} مرة")

    # 2. relation targets exist
    for e in entities:
        for rel_name, targets in e.get("relations", {}).items():
            for t in targets:
                if t not in by_id:
                    errors.append(f"{e['id']}: relations.{rel_name} يشير إلى id غير موجود: {t}")
        chapter_id = e.get("metadata", {}).get("chapter_id")
        if chapter_id and chapter_id not in by_id:
            errors.append(f"{e['id']}: metadata.chapter_id غير موجود: {chapter_id}")

    # 3. letter_set count == len(letters)
    for e in entities:
        if e["type"] == "letter_set":
            letters = e["metadata"]["letters"]
            count = e["metadata"]["count"]
            if len(letters) != count:
                errors.append(f"{e['id']}: count={count} لكن letters.length={len(letters)}")

    # 4. mnemonic decode check
    for e in entities:
        if e["type"] != "mnemonic":
            continue
        method = e["metadata"]["decode_method"]
        phrase = e["metadata"]["phrase"]
        decoded = e["metadata"]["decoded_letters"]
        if method == "all_letters":
            computed = decode_all_letters(phrase)
            if computed != decoded:
                errors.append(f"{e['id']}: decoded_letters لا يطابق التحليل الآلي لـ «{phrase}»: {computed} != {decoded}")
        elif method == "first_letter_of_word":
            computed = decode_first_letter_of_word(phrase)
            if computed != decoded:
                errors.append(f"{e['id']}: decoded_letters لا يطابق أول حرف من كل كلمة في «{phrase}»: {computed} != {decoded}")
        elif method == "contains_letters":
            cleaned = strip_tashkeel(phrase)
            for letter in decoded:
                if letter not in cleaned:
                    warnings.append(f"{e['id']}: الحرف {letter} غير موجود حرفياً في «{phrase}»")
        elif method == "all_letters_except_alif":
            computed = decode_all_letters_except_alif(phrase)
            if computed != decoded:
                errors.append(f"{e['id']}: decoded_letters لا يطابق (بإسقاط الألف) تحليل «{phrase}»: {computed} != {decoded}")
        else:
            errors.append(f"{e['id']}: decode_method غير معروف: {method}")

    # 5. chapter bayt_range vs bayt_count_marker, and actual bayt entities in range
    bayt_numbers_by_chapter = {}
    for e in entities:
        if e["type"] == "bayt":
            cid = e["metadata"]["chapter_id"]
            bayt_numbers_by_chapter.setdefault(cid, []).append(e["metadata"]["number"])

    for e in entities:
        if e["type"] != "chapter":
            continue
        first, last = e["metadata"]["bayt_range"]
        marker = e["metadata"]["bayt_count_marker"]
        if last - first + 1 != marker:
            errors.append(f"{e['id']}: bayt_range={e['metadata']['bayt_range']} لا يطابق bayt_count_marker={marker}")
        actual = sorted(bayt_numbers_by_chapter.get(e["id"], []))
        expected = list(range(first, last + 1))
        if actual != expected:
            errors.append(f"{e['id']}: أبيات chapter_id الفعلية {actual} != المتوقعة {expected}")

    # 6. anchor content consistency: a bayt anchor's line must carry its own number + ")";
    #    a chapter anchor's line must start with its order + "-".
    for e in entities:
        if e["type"] == "bayt":
            marker = arabic_num(e["metadata"]["number"]) + ")"
            for a in e["anchors"]:
                lines = get_block(a["page"], a["block_id"])
                line_text = (lines or {}).get(str(a.get("line", "")), "")
                if marker not in line_text:
                    errors.append(f"{e['id']}: السطر المرتبط لا يحتوي الرقم المطبوع «{marker}» (صفحة {a['page']})")
        elif e["type"] == "chapter":
            marker = arabic_num(e["metadata"]["order"]) + "-"
            for a in e["anchors"]:
                lines = get_block(a["page"], a["block_id"])
                line_text = (lines or {}).get(str(a.get("line", "")), "").strip()
                if not line_text.startswith(marker):
                    errors.append(f"{e['id']}: السطر المرتبط لا يبدأ برقم الباب «{marker}» (صفحة {a['page']}): «{line_text}»")

    # 7. stated_count vs relations.children
    for e in entities:
        stated = e.get("metadata", {}).get("stated_count")
        if stated is None:
            continue
        children = e.get("relations", {}).get("children", [])
        if len(children) != stated:
            errors.append(f"{e['id']}: stated_count={stated} لكن عدد children={len(children)}")

    # 8. 28-letter partitions (the matn's own hukm groups must tile the alphabet with no gaps/overlaps;
    #    hamza (ء) and alif (ا) are the same alphabet slot, normalized before comparing)
    partitions = [
        ("أحكام النون الساكنة والتنوين", ["letters.idhar-halqi", "letters.idgham-bighunnah",
                                           "letters.idgham-bilaghunnah", "letters.iqlab", "letters.ikhfa-nun"]),
        ("أحكام الميم الساكنة", ["letters.ikhfa-shafawi", "letters.idgham-shafawi", "letters.idhar-shafawi"]),
        ("لام أل (قمرية/شمسية)", ["letters.qamariyyah", "letters.shamsiyyah"]),
    ]
    for label, ids in partitions:
        sets = []
        for lid in ids:
            if lid not in by_id:
                errors.append(f"تقسيم «{label}»: {lid} غير موجود")
                continue
            sets.append(to_alphabet_set(by_id[lid]["metadata"]["letters"]))
        total_count = sum(len(s) for s in sets)
        union = set().union(*sets) if sets else set()
        if total_count != len(union):
            errors.append(f"تقسيم «{label}»: تداخل بين المجموعات (مجموع الأعداد {total_count} != حجم الاتحاد {len(union)})")
        if union != ALPHABET_28:
            missing = ALPHABET_28 - union
            extra = union - ALPHABET_28
            errors.append(f"تقسيم «{label}»: لا يغطي الأبجدية الـ28 بالكامل (ناقص: {missing or '-'}، زائد: {extra or '-'})")

    print(f"الكيانات: {len(entities)}")
    for w in warnings:
        print(f"تحذير: {w}")
    if errors:
        print(f"\n{len(errors)} خطأ:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    print("نجح المدقق بلا أخطاء.")


if __name__ == "__main__":
    main()
