"""Crop individual printed lines (by data-line number) from a page scan, enlarged.

Usage: python3 crop_lines.py <image> <out-dir> <line,line,...> --total N [--scale S]

The text area (below the long rule under the running header, down to the last ink
row) is divided evenly into N lines, N being the page's line count from the HTML.
Each crop spans one pitch plus overlap on both sides, so the target line is always
fully inside it, with slivers of its neighbours. Scans are noisy and slightly
skewed, which defeats ink-gap line detection, hence the even division.
Writes <out-dir>/<stem>-L<n>.png.
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

INK_THRESHOLD = 128
RULE_MIN_WIDTH_RATIO = 0.55
MIN_INK_PIXELS = 30
MARGIN_RATIO = 0.08
OVERLAP_PITCH = 0.35
DEFAULT_SCALE = 1.8
HEADER_SEARCH_RATIO = 0.25


def ink_rows(gray: np.ndarray) -> np.ndarray:
    margin = int(gray.shape[1] * MARGIN_RATIO)
    return (gray[:, margin:gray.shape[1] - margin] < INK_THRESHOLD).sum(axis=1)


def find_rule_bottom(gray: np.ndarray) -> int:
    """Row just below the long horizontal rule under the running header (0 if none)."""
    width = gray.shape[1] * (1 - 2 * MARGIN_RATIO)
    limit = int(gray.shape[0] * HEADER_SEARCH_RATIO)
    wide = np.where(ink_rows(gray[:limit]) > width * RULE_MIN_WIDTH_RATIO)[0]
    return int(wide.max()) + 2 if wide.size else 0


def last_ink_row(gray: np.ndarray) -> int:
    rows = np.where(ink_rows(gray) > MIN_INK_PIXELS)[0]
    return int(rows.max()) if rows.size else gray.shape[0] - 1


def crop_lines(image: Path, out_dir: Path, wanted: list[int], total: int, scale: float) -> list[Path]:
    with Image.open(image) as img:
        page = img.convert("L")
    gray = np.asarray(page)
    top = find_rule_bottom(gray)
    bottom = last_ink_row(gray)
    pitch = (bottom - top) / total
    out_dir.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for n in wanted:
        if not 1 <= n <= total:
            print(f"line {n}: outside 1..{total}", file=sys.stderr)
            continue
        y0 = int(top + (n - 1) * pitch - OVERLAP_PITCH * pitch)
        y1 = int(top + n * pitch + OVERLAP_PITCH * pitch)
        crop = page.crop((0, max(0, y0), page.width, min(page.height, y1)))
        crop = crop.resize((int(crop.width * scale), int(crop.height * scale)), Image.LANCZOS)
        path = out_dir / f"{image.stem}-L{n}.png"
        crop.save(path)
        paths.append(path)
    return paths


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path)
    parser.add_argument("out_dir", type=Path)
    parser.add_argument("lines")
    parser.add_argument("--total", type=int, required=True)
    parser.add_argument("--scale", type=float, default=DEFAULT_SCALE)
    args = parser.parse_args()
    try:
        wanted = [int(x) for x in args.lines.split(",") if x]
        for path in crop_lines(args.image, args.out_dir, wanted, args.total, args.scale):
            print(path)
    except (OSError, ValueError) as err:
        print(f"Failed to crop lines of {args.image}: {err}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
