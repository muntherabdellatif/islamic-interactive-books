#!/usr/bin/env python3
"""
Batch download classical matn PDFs from Archive.org and convert them to optimized WebP images
following the Islamic Interactive Books pipeline standards.
"""

import os
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from pdf_to_webp import convert_pdf_to_webp

sys.stdout.reconfigure(encoding='utf-8')

# Map of book_id to archive.org identifier and optional file pattern
BOOKS_TO_PROCESS = [
    {
        "id": "al-shamail-al-muhammadiyyah",
        "archive_id": "20200426_20200426_2205",
        "name_ar": "الشمائل المحمدية",
    },
    {
        "id": "umdat-al-fiqh",
        "archive_id": "OumdatulFiqh",
        "name_ar": "عمدة الفقه في المذهب الحنبلي",
    },
    {
        "id": "mukhtasar-al-quduri",
        "archive_id": "sarayassaf_gmail_20170322_2353",
        "name_ar": "مختصر القدوري في الفقه الحنفي",
    },
    {
        "id": "al-qawaid-al-fiqhiyyah-al-kubra",
        "archive_id": "20200821_20200821_1104",
        "name_ar": "القواعد الفقهية الخمس الكبرى",
    },
]


def get_primary_pdf_filename(archive_id: str) -> str:
    url = f"https://archive.org/download/{archive_id}/{archive_id}_files.xml"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        tree = ET.fromstring(resp.read())
        candidates = []
        for f in tree.findall("file"):
            name = f.get("name", "")
            if name.lower().endswith(".pdf") and not name.lower().endswith("_text.pdf"):
                size = int(f.findtext("size", "0"))
                candidates.append((name, size))

        if not candidates:
            # Fallback to any pdf
            for f in tree.findall("file"):
                name = f.get("name", "")
                if name.lower().endswith(".pdf"):
                    size = int(f.findtext("size", "0"))
                    candidates.append((name, size))

        if not candidates:
            raise RuntimeError(f"No PDF found in item '{archive_id}'")

        # Pick the most suitable candidate (prefer non-empty, reasonable size)
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]


def process_book(item: dict) -> int:
    book_id = item["id"]
    archive_id = item["archive_id"]
    name_ar = item["name_ar"]

    print(f"\n==========================================")
    print(f"Processing '{name_ar}' ({book_id}) from [{archive_id}]")
    print(f"==========================================")

    base_dir = os.path.join("data", "books", book_id)
    pdf_dir = os.path.join(base_dir, "pdf")
    img_dir = os.path.join(base_dir, "images")
    source_dir = os.path.join(base_dir, "source")
    raw_dir = os.path.join(base_dir, "raw-data")
    html_dir = os.path.join(base_dir, "html")
    fmt_dir = os.path.join(base_dir, "formatted-data")

    for d in [pdf_dir, img_dir, source_dir, raw_dir, html_dir, fmt_dir]:
        os.makedirs(d, exist_ok=True)

    pdf_dest = os.path.join(pdf_dir, f"{book_id}.pdf")

    if not os.path.exists(pdf_dest) or os.path.getsize(pdf_dest) == 0:
        print(f"Locating PDF on archive.org...")
        fname = get_primary_pdf_filename(archive_id)
        print(f"Found remote file: '{fname}'")
        encoded_fname = urllib.parse.quote(fname)
        dl_url = f"https://archive.org/download/{archive_id}/{encoded_fname}"
        print(f"Downloading from {dl_url}...")
        req = urllib.request.Request(dl_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp, open(pdf_dest, "wb") as out_f:
            out_f.write(resp.read())
        print(f"Downloaded: {pdf_dest} ({os.path.getsize(pdf_dest) / 1024:.1f} KB)")
    else:
        print(f"Using existing PDF: {pdf_dest}")

    print(f"Converting pages to WebP in '{img_dir}'...")
    convert_pdf_to_webp(pdf_dest, img_dir, target_width=1200, quality=82)

    webp_files = [f for f in os.listdir(img_dir) if f.endswith(".webp")]
    print(f"Successfully generated {len(webp_files)} WebP pages for '{name_ar}'.")
    return len(webp_files)


def main():
    results = {}
    for item in BOOKS_TO_PROCESS:
        try:
            count = process_book(item)
            results[item["id"]] = count
        except Exception as e:
            print(f"ERROR processing {item['id']}: {e}", file=sys.stderr)
            results[item["id"]] = -1

    print("\n\n##########################################")
    print("BATCH PROCESSING SUMMARY")
    print("##########################################")
    for k, v in results.items():
        print(f"  {k}: {v} pages")


if __name__ == "__main__":
    main()
