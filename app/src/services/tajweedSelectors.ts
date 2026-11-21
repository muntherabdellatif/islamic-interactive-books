import type { TajweedDataset } from "./tajweedDataService";
import type {
  BaytEntity,
  BookEntity,
  ChapterEntity,
  EntityType,
  EntityTypeMap,
  TajweedRuleEntity,
} from "../types/entities";
import type { QuizQuestion, RuleData, SupplementaryExample, VideoRef } from "../types/interactive";
import { ANNOTATED_EDITION_MAX_PAGE, DEFAULT_CARD_COLOR, FULL_ALPHABET_SIZE } from "../constants/ui";

export function getEntity(dataset: TajweedDataset, id: string): BookEntity | null {
  return dataset.byId.get(id) ?? null;
}

export function entitiesOnPage(dataset: TajweedDataset, pageNumber: number): BookEntity[] {
  return dataset.entities.filter((entity) => entity.anchors.some((anchor) => anchor.page === pageNumber));
}

export function entitiesOfType<TType extends EntityType>(
  dataset: TajweedDataset,
  type: TType,
): Array<EntityTypeMap[TType]> {
  return dataset.entities.filter((entity) => entity.type === type) as Array<EntityTypeMap[TType]>;
}

export function relatedEntitiesOfType<TType extends EntityType>(
  dataset: TajweedDataset,
  entity: BookEntity,
  type: TType,
): Array<EntityTypeMap[TType]> {
  const relatedIds = dataset.graph.get(entity.id) ?? new Set<string>();
  const related: Array<EntityTypeMap[TType]> = [];
  for (const id of relatedIds) {
    const candidate = getEntity(dataset, id);
    if (candidate && candidate.type === type) related.push(candidate as EntityTypeMap[TType]);
  }
  return related;
}

export function chapterForPage(dataset: TajweedDataset, pageNumber: number): ChapterEntity | null {
  const onPage = entitiesOnPage(dataset, pageNumber);
  return (onPage.find((entity) => entity.type === "chapter") as ChapterEntity | undefined) ?? null;
}

/**
 * The chapter of the page's FIRST printed bayt/rule by line order, not just any chapter
 * entity anchored on the page — a chapter heading can land on the page that still closes
 * out the previous chapter's bayts.
 */
export function chapterForPageContent(dataset: TajweedDataset, pageNumber: number): ChapterEntity | null {
  const pageEntities = entitiesOnPage(dataset, pageNumber);
  const lineOf = (entity: BookEntity): number =>
    entity.anchors.find((anchor) => anchor.page === pageNumber)?.line ?? Number.POSITIVE_INFINITY;

  const bayts = pageEntities.filter((e) => e.type === "bayt").sort((a, b) => lineOf(a) - lineOf(b));
  if (bayts.length > 0) return chapterOf(dataset, bayts[0] ?? null);

  const rules = pageEntities.filter((e) => e.type === "tajweed_rule").sort((a, b) => lineOf(a) - lineOf(b));
  if (rules.length > 0) return chapterOf(dataset, rules[0] ?? null);

  return chapterForPage(dataset, pageNumber);
}

export function chapterOf(dataset: TajweedDataset, entity: BookEntity | null): ChapterEntity | null {
  if (!entity) return null;
  if (entity.type === "chapter") return entity as ChapterEntity;

  const chapterId = (entity.metadata as { chapter_id?: string }).chapter_id;
  if (chapterId) return (getEntity(dataset, chapterId) as ChapterEntity | null) ?? null;

  const [directParent] = relatedEntitiesOfType(dataset, entity, "chapter");
  if (directParent) return directParent;

  const parentIds = entity.relations?.parent ?? [];
  for (const parentId of parentIds) {
    const found = chapterOf(dataset, getEntity(dataset, parentId));
    if (found) return found;
  }
  return null;
}

export function isLeafRule(rule: TajweedRuleEntity): boolean {
  return (rule.relations?.children ?? []).length === 0;
}

export function leafRulesOfChapter(dataset: TajweedDataset, chapter: ChapterEntity): TajweedRuleEntity[] {
  return entitiesOfType(dataset, "tajweed_rule").filter((rule) => {
    const owner = chapterOf(dataset, rule);
    return owner?.id === chapter.id && isLeafRule(rule);
  });
}

export function baytsOfChapter(dataset: TajweedDataset, chapter: ChapterEntity): BaytEntity[] {
  return entitiesOfType(dataset, "bayt")
    .filter((bayt) => chapterOf(dataset, bayt)?.id === chapter.id)
    .sort((a, b) => a.metadata.number - b.metadata.number);
}

export function baytCommentary(dataset: TajweedDataset, baytId: string): string {
  return dataset.interactive.bayt_commentary[baytId] ?? "";
}

export function chapterVideos(dataset: TajweedDataset, chapterId: string): VideoRef[] {
  return dataset.interactive.chapter_videos[chapterId] ?? [];
}

export function ruleVideos(dataset: TajweedDataset, ruleId: string): VideoRef[] {
  return dataset.interactive.rule_videos[ruleId] ?? [];
}

/**
 * If a chapter's leaf rules' letter_sets exactly partition the 28-letter alphabet, build an
 * interactive letter -> rule id map; otherwise null so callers fall back to a plain list.
 */
export function letterPartitionForChapter(
  dataset: TajweedDataset,
  chapter: ChapterEntity,
): Map<string, string> | null {
  const rules = leafRulesOfChapter(dataset, chapter);
  const map = new Map<string, string>();
  let total = 0;
  for (const rule of rules) {
    const letterSets = relatedEntitiesOfType(dataset, rule, "letter_set");
    for (const letterSet of letterSets) {
      for (const letter of letterSet.metadata.letters) {
        if (map.has(letter)) return null;
        map.set(letter, rule.id);
        total += 1;
      }
    }
  }
  return total === FULL_ALPHABET_SIZE ? map : null;
}

export function ruleCard(dataset: TajweedDataset, ruleId: string): RuleData | null {
  return dataset.interactive.rules[ruleId] ?? null;
}

export function matnExampleAudio(dataset: TajweedDataset, exampleId: string) {
  return dataset.interactive.examples_audio[exampleId] ?? null;
}

export function quizFor(dataset: TajweedDataset, chapterId: string): QuizQuestion[] {
  const value = dataset.interactive.quiz[chapterId];
  return Array.isArray(value) ? value : [];
}

export function categoryColor(dataset: TajweedDataset, category: string): string {
  return dataset.interactive.category_colors[category] ?? DEFAULT_CARD_COLOR;
}

export function makhrajRegions(dataset: TajweedDataset): Record<string, string> {
  return dataset.interactive.makhraj_regions;
}

/** Lowest page (<= 10, the fully-annotated edition) this entity or a related bayt is anchored on. */
export function firstAnnotatedPage(dataset: TajweedDataset, entity: BookEntity): number | null {
  const bayts = entity.type === "bayt" ? [entity as BaytEntity] : relatedEntitiesOfType(dataset, entity, "bayt");
  const pages = bayts
    .flatMap((bayt) => bayt.anchors.map((anchor) => anchor.page))
    .filter((page) => page <= ANNOTATED_EDITION_MAX_PAGE);
  return pages.length ? Math.min(...pages) : null;
}

export function lettersForRegion(dataset: TajweedDataset, regionId: string): string[] {
  const zones = dataset.interactive.letter_zones;
  return Object.keys(zones).filter((letter) => zones[letter] === regionId);
}

export function khayshumLetters(dataset: TajweedDataset): string[] {
  return dataset.interactive.khayshum_letters;
}

export function supplementaryExamplesFor(rule: RuleData | null): SupplementaryExample[] {
  return rule?.supplementary_examples ?? [];
}
