#!/usr/bin/env python3
"""
Optimize raw PNG/JPEG book page images to standard WebP format.
Adheres to the image-optimizer skill guidelines:
- Format: WebP
- Standard Width: 1200px
- Quality: 82
- Compression method: 6
"""

import argparse
import os
import sys
from PIL import Image


def optimize_image(
    input_path: str,
    output_path: str,
    target_width: int = 1200,
    quality: int = 82,
) -> int:
    with Image.open(input_path) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        w_percent = target_width / float(img.size[0])
        target_height = int(float(img.size[1]) * float(w_percent))
        resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        resized.save(output_path, "WEBP", quality=quality, method=6)
        return os.path.getsize(output_path)


def main():
    parser = argparse.ArgumentParser(description="Optimize page images to WebP.")
    parser.add_argument("--input-dir", required=True, help="Directory with source images")
    parser.add_argument("--output-dir", required=True, help="Directory to save WebP images")
    parser.add_argument("--target-width", type=int, default=1200, help="Target width in px (default: 1200)")
    parser.add_argument("--quality", type=int, default=82, help="WebP quality (default: 82)")

    args = parser.parse_args()
    if not os.path.isdir(args.input_dir):
        print(f"Error: Directory not found: {args.input_dir}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)
    valid_exts = (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp")
    files = sorted([f for f in os.listdir(args.input_dir) if f.lower().endswith(valid_exts)])

    print(f"Found {len(files)} images in '{args.input_dir}'. Optimizing...")
    for idx, fname in enumerate(files, 1):
        in_file = os.path.join(args.input_dir, fname)
        out_name = f"{idx}.webp"
        out_file = os.path.join(args.output_dir, out_name)
        size_bytes = optimize_image(in_file, out_file, args.target_width, args.quality)
        size_kb = size_bytes / 1024.0
        status = "OK" if size_kb <= 180 else "WARN (>180KB)"
        print(f"  [{idx:02d}/{len(files):02d}] {fname} -> {out_name} ({size_kb:.1f} KB) [{status}]")

    print("Image optimization complete.")


if __name__ == "__main__":
    main()
