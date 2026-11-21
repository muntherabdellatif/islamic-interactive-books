import type { BookEntity, EntitiesFile } from "../types/entities";
import type { InteractiveFile } from "../types/interactive";
import { PAGE_PREFETCH_RADIUS, PAGE_PRELOAD_IDLE_DELAY_MS } from "../constants/ui";

export interface TajweedDataset {
  entities: BookEntity[];
  byId: Map<string, BookEntity>;
  graph: Map<string, Set<string>>;
  interactive: InteractiveFile;
}

const pageHtmlCache = new Map<string, string>();
const inFlightHtmlRequests = new Map<string, Promise<string>>();
const preloadedImages = new Set<string>();

function cacheKey(bookId: string, pageNumber: number): string {
  return `${bookId}:${pageNumber}`;
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
    fetch(`/data/${bookId}/entities.json`),
    fetch(`/data/${bookId}/interactive.json`),
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

export function getCachedBookPageHtml(bookId: string, pageNumber: number): string | undefined {
  return pageHtmlCache.get(cacheKey(bookId, pageNumber));
}

export async function loadBookPageHtml(bookId: string, pageNumber: number): Promise<string> {
  const key = cacheKey(bookId, pageNumber);
  const cached = pageHtmlCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const inFlight = inFlightHtmlRequests.get(key);
  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    try {
      const response = await fetch(`/data/${bookId}/html/${pageNumber}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load page ${pageNumber} HTML for ${bookId}: HTTP ${response.status}`);
      }
      const text = await response.text();
      pageHtmlCache.set(key, text);
      return text;
    } finally {
      inFlightHtmlRequests.delete(key);
    }
  })();

  inFlightHtmlRequests.set(key, request);
  return request;
}

export function preloadBookPageImage(bookId: string, pageNumber: number): void {
  const src = `/data/${bookId}/images/${pageNumber}.webp`;
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
}

export function prefetchBookPageHtml(bookId: string, pageNumber: number): Promise<void> {
  const key = cacheKey(bookId, pageNumber);
  if (pageHtmlCache.has(key) || inFlightHtmlRequests.has(key)) {
    return Promise.resolve();
  }
  return loadBookPageHtml(bookId, pageNumber).then(() => undefined).catch(() => undefined);
}

export function prefetchAdjacentPages(
  bookId: string,
  currentPage: number,
  pageCount: number,
  radius: number = PAGE_PREFETCH_RADIUS,
): void {
  const start = Math.max(1, currentPage - radius);
  const end = Math.min(pageCount, currentPage + radius);

  for (let page = start; page <= end; page++) {
    if (page === currentPage) continue;
    void prefetchBookPageHtml(bookId, page);
    preloadBookPageImage(bookId, page);
  }
}

export function prefetchAllPagesInBackground(
  bookId: string,
  pageCount: number,
  idleDelayMs: number = PAGE_PRELOAD_IDLE_DELAY_MS,
): () => void {
  let isCancelled = false;
  let timerId: number | undefined;

  const prefetchAll = async () => {
    for (let page = 1; page <= pageCount; page++) {
      if (isCancelled) break;
      const key = cacheKey(bookId, page);
      if (!pageHtmlCache.has(key)) {
        await prefetchBookPageHtml(bookId, page);
        // Small pause to yield to main thread / user interactions
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      if (isCancelled) break;
      preloadBookPageImage(bookId, page);
    }
  };

  timerId = window.setTimeout(() => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        if (!isCancelled) void prefetchAll();
      });
    } else {
      void prefetchAll();
    }
  }, idleDelayMs);

  return () => {
    isCancelled = true;
    if (timerId !== undefined) clearTimeout(timerId);
  };
}
