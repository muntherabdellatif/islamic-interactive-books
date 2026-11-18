"""Split a scanned page into overlapping horizontal strips for close reading.

Usage: python3 crop_page.py <image> <output-dir> [--strips N] [--scale S]
Writes <output-dir>/<stem>-s<k>.png and prints each path.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

DEFAULT_STRIPS = 4
OVERLAP_RATIO = 0.06
DEFAULT_SCALE = 1.0


def crop_strips(image_path: Path, out_dir: Path, strips: int, scale: float) -> list[Path]:
    with Image.open(image_path) as img:
        page = img.convert("L")
        width, height = page.size
        step = height / strips
        overlap = int(height * OVERLAP_RATIO)
        out_dir.mkdir(parents=True, exist_ok=True)
        paths = []
        for k in range(strips):
            top = max(0, int(k * step) - overlap)
            bottom = min(height, int((k + 1) * step) + overlap)
            strip = page.crop((0, top, width, bottom))
            if scale != 1.0:
                strip = strip.resize((int(width * scale), int((bottom - top) * scale)), Image.LANCZOS)
            path = out_dir / f"{image_path.stem}-s{k + 1}.png"
            strip.save(path)
            paths.append(path)
        return paths


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path)
    parser.add_argument("out_dir", type=Path)
    parser.add_argument("--strips", type=int, default=DEFAULT_STRIPS)
    parser.add_argument("--scale", type=float, default=DEFAULT_SCALE)
    args = parser.parse_args()
    try:
        for path in crop_strips(args.image, args.out_dir, args.strips, args.scale):
            print(path)
    except OSError as err:
        print(f"Failed to crop {args.image}: {err}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
