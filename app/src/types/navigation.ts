export type ViewMode = "text" | "scan";
export type MobilePaneView = "book" | "panel";


export interface BookViewerRouteParams {
  bookId: string;
}

export const PAGE_QUERY_PARAM = "page" as const;
export const VIEW_MODE_QUERY_PARAM = "view" as const;
