#!/usr/bin/env python
"""Validate data/books/<BOOK>/interactive.json (stage 4) against entities.json (stage 2)."""
import argparse
import json
import sys
from pathlib import Path

BOOK_DIR = Path(__file__).resolve().parents[2] / "data" / "books"


def load(book: str):
    entities = json.loads((BOOK_DIR / book / "entities.json").read_text(encoding="utf-8"))["entities"]
    interactive = json.loads((BOOK_DIR / book / "interactive.json").read_text(encoding="utf-8"))
    return entities, interactive


def by_type(entities, type_name):
    return {e["id"]: e for e in entities if e["type"] == type_name}


def check(entities, interactive):
    errors = []
    by_id = {e["id"]: e for e in entities}
    rules = by_type(entities, "tajweed_rule")
    chapters = by_type(entities, "chapter")
    examples = by_type(entities, "example_word")

    # 1. every tajweed_rule must have a card, and every card must reference a real rule.
    rule_cards = interactive.get("rules", {})
    for rid in rules:
        if rid not in rule_cards:
            errors.append(f"rule missing interactive card: {rid}")
    for rid in rule_cards:
        if rid not in rules:
            errors.append(f"interactive card references unknown rule id: {rid}")

    # 2. every makhraj_regions key referenced by a rule card must exist.
    region_ids = set(interactive.get("makhraj_regions", {}).keys()) - {"note_ar"}
    for rid, card in rule_cards.items():
        for region in card.get("makhraj_regions", []):
            if region not in region_ids:
                errors.append(f"rule {rid} references unknown makhraj region: {region}")
        if not card.get("simplified_ar", "").strip():
            errors.append(f"rule {rid} has an empty simplified_ar")
        for i, ex in enumerate(card.get("supplementary_examples", [])):
            surah, ayah = ex.get("surah"), ex.get("ayah")
            if not (isinstance(surah, int) and 1 <= surah <= 114):
                errors.append(f"rule {rid} supplementary_examples[{i}] has invalid surah: {surah}")
            if not (isinstance(ayah, int) and ayah >= 1):
                errors.append(f"rule {rid} supplementary_examples[{i}] has invalid ayah: {ayah}")
            url = ex.get("audio_url", "")
            expected = f"{surah:03d}{ayah:03d}.mp3" if isinstance(surah, int) and isinstance(ayah, int) else None
            if expected and not url.endswith(expected):
                errors.append(f"rule {rid} supplementary_examples[{i}] audio_url does not match surah:ayah {surah}:{ayah}")
            if not ex.get("word", "").strip():
                errors.append(f"rule {rid} supplementary_examples[{i}] has an empty word")
            if not ex.get("citation_method", "").strip():
                errors.append(f"rule {rid} supplementary_examples[{i}] is missing a citation_method")

    # 3. every examples_audio key must be a real example_word id, with a plausible surah/ayah.
    for ex_id, audio in interactive.get("examples_audio", {}).items():
        if ex_id not in examples:
            errors.append(f"examples_audio references unknown example_word id: {ex_id}")
            continue
        surah, ayah = audio.get("surah"), audio.get("ayah")
        if not (isinstance(surah, int) and 1 <= surah <= 114):
            errors.append(f"examples_audio[{ex_id}] has invalid surah number: {surah}")
        if not (isinstance(ayah, int) and ayah >= 1):
            errors.append(f"examples_audio[{ex_id}] has invalid ayah number: {ayah}")
        url = audio.get("audio_url", "")
        expected = f"{surah:03d}{ayah:03d}.mp3" if isinstance(surah, int) and isinstance(ayah, int) else None
        if expected and not url.endswith(expected):
            errors.append(f"examples_audio[{ex_id}] audio_url does not match surah:ayah {surah}:{ayah}")

    # 4. quiz chapter keys must be real chapter ids.
    for chapter_id, items in interactive.get("quiz", {}).items():
        if chapter_id == "note_ar":
            continue
        if chapter_id not in chapters:
            errors.append(f"quiz references unknown chapter id: {chapter_id}")
            continue
        for i, item in enumerate(items):
            if not (0 <= item.get("answer_index", -1) < len(item.get("choices_ar", []))):
                errors.append(f"quiz[{chapter_id}][{i}] has an out-of-range answer_index")

    # 5. category_colors should cover every category used by a tajweed_rule.
    used_categories = {e["metadata"].get("category") for e in rules.values() if e["metadata"].get("category")}
    missing_colors = used_categories - set(interactive.get("category_colors", {}).keys())
    if missing_colors:
        errors.append(f"category_colors missing for: {sorted(missing_colors)}")

    # 6. letter_zones must cover every distinct letter used anywhere in the book's letter_sets
    #    (the makhraj tab's "pick a letter" map is only as correct as this table).
    all_book_letters = set()
    for e in entities:
        if e["type"] == "letter_set":
            all_book_letters.update(e["metadata"]["letters"])
    zones = interactive.get("letter_zones", {})
    missing_letters = all_book_letters - set(zones.keys())
    if missing_letters:
        errors.append(f"letter_zones missing letters used in the book: {sorted(missing_letters)}")
    valid_region_ids = region_ids
    bad_zone_values = {v for v in zones.values() if v not in valid_region_ids}
    if bad_zone_values:
        errors.append(f"letter_zones points to unknown region id(s): {sorted(bad_zone_values)}")

    # 7. chapter_videos / rule_videos must point at real chapters/rules and carry a youtube_id.
    for chapter_id, video in interactive.get("chapter_videos", {}).items():
        if chapter_id not in chapters:
            errors.append(f"chapter_videos references unknown chapter id: {chapter_id}")
        if not video.get("youtube_id", "").strip():
            errors.append(f"chapter_videos[{chapter_id}] is missing youtube_id")
    for rule_id, video in interactive.get("rule_videos", {}).items():
        if rule_id not in rules:
            errors.append(f"rule_videos references unknown rule id: {rule_id}")
        if not video.get("youtube_id", "").strip():
            errors.append(f"rule_videos[{rule_id}] is missing youtube_id")

    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", required=True)
    args = parser.parse_args()

    entities, interactive = load(args.book)
    errors = check(entities, interactive)
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        sys.exit(1)
    print(f"OK: interactive.json for '{args.book}' is consistent with entities.json "
          f"({len(interactive.get('rules', {}))} rule cards, {len(interactive.get('examples_audio', {}))} audio examples).")


if __name__ == "__main__":
    main()
