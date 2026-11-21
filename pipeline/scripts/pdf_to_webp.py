#!/usr/bin/env python3
"""
Convert PDF book pages directly to optimized WebP images
following the Islamic Interactive Books pipeline standards:
- Format: WebP
- Standard Width: 1200px
- Quality: 82
- Compression method: 6 (max)
- Target file size: <= 180 KB
"""

import argparse
import os
import sys
import fitz  # PyMuPDF
from PIL import Image


def convert_pdf_to_webp(
    pdf_path: str,
    output_dir: str,
    target_width: int = 1200,
    quality: int = 82,
    start_page: int = 1,
    end_page: int | None = None,
) -> None:
    if not os.path.isfile(pdf_path):
        print(f"Error: PDF file not found at: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"Opened PDF '{pdf_path}' ({total_pages} total pages).")

    actual_start = max(1, start_page)
    actual_end = min(total_pages, end_page if end_page is not None else total_pages)

    print(f"Processing pages {actual_start} to {actual_end} -> '{output_dir}'...")

    for page_idx in range(actual_start - 1, actual_end):
        page_num = page_idx + 1
        page = doc[page_idx]

        # Render at 2x resolution (144 DPI) for crisp Arabic diacritics
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)

        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

        # Scale proportionally to target_width
        w_percent = target_width / float(img.size[0])
        target_height = int(float(img.size[1]) * float(w_percent))
        resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)

        out_path = os.path.join(output_dir, f"{page_num}.webp")
        resized.save(out_path, "WEBP", quality=quality, method=6)

        size_kb = os.path.getsize(out_path) / 1024.0
        status = "OK" if size_kb <= 180 else "WARN (>180KB)"
        print(f"  Page {page_num:02d}: {resized.size[0]}x{resized.size[1]} | {size_kb:.1f} KB [{status}]")

    print(f"Finished processing {actual_end - actual_start + 1} pages.")


def main():
    parser = argparse.ArgumentParser(description="Convert PDF book pages to optimized WebP images.")
    parser.add_argument("--pdf", required=True, help="Path to input PDF file")
    parser.add_argument("--out-dir", required=True, help="Directory to save WebP images")
    parser.add_argument("--target-width", type=int, default=1200, help="Target image width in px (default: 1200)")
    parser.add_argument("--quality", type=int, default=82, help="WebP quality (default: 82)")
    parser.add_argument("--start-page", type=int, default=1, help="First page to convert (1-indexed)")
    parser.add_argument("--end-page", type=int, default=None, help="Last page to convert (default: all)")

    args = parser.parse_args()
    convert_pdf_to_webp(
        pdf_path=args.pdf,
        output_dir=args.out_dir,
        target_width=args.target_width,
        quality=args.quality,
        start_page=args.start_page,
        end_page=args.end_page,
    )


if __name__ == "__main__":
    main()
