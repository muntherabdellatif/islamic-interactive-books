import type { BookEntity, EntitiesFile } from "../types/entities";
import type { InteractiveFile } from "../types/interactive";

export interface TajweedDataset {
  entities: BookEntity[];
  byId: Map<string, BookEntity>;
  graph: Map<string, Set<string>>;
  interactive: InteractiveFile;
}

function flattenRelationIds(entity: BookEntity): string[] {
  const relations = entity.relations ?? {};
  return Object.values(relations).flatMap((value) => (Array.isArray(value) ? value : []));
}

function buildGraph(entities: BookEntity[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  const link = (a: string, b: string): void => {
    if (!graph.has(a)) graph.set(a, new Set());
    graph.get(a)?.add(b);
  };
  for (const entity of entities) {
    for (const otherId of flattenRelationIds(entity)) {
      link(entity.id, otherId);
      link(otherId, entity.id);
    }
  }
  return graph;
}

export async function loadTajweedDataset(bookId: string): Promise<TajweedDataset> {
  const [entitiesResponse, interactiveResponse] = await Promise.all([
    fetch(`/data/${bookId}/entities.json`, { cache: "no-store" }),
    fetch(`/data/${bookId}/interactive.json`, { cache: "no-store" }),
  ]);

  if (!entitiesResponse.ok) {
    throw new Error(`Failed to load entities.json for ${bookId}: HTTP ${entitiesResponse.status}`);
  }
  if (!interactiveResponse.ok) {
    throw new Error(`Failed to load interactive.json for ${bookId}: HTTP ${interactiveResponse.status}`);
  }

  const entitiesFile = (await entitiesResponse.json()) as EntitiesFile;
  const interactive = (await interactiveResponse.json()) as InteractiveFile;
  const entities = entitiesFile.entities;
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const graph = buildGraph(entities);

  return { entities, byId, graph, interactive };
}

export async function loadBookPageHtml(bookId: string, pageNumber: number): Promise<string> {
  const response = await fetch(`/data/${bookId}/html/${pageNumber}.html`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load page ${pageNumber} HTML for ${bookId}: HTTP ${response.status}`);
  }
  return response.text();
}
