import { useEffect, useState } from "react";
import { loadTajweedDataset, type TajweedDataset } from "../services/tajweedDataService";

export type TajweedBookDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; dataset: TajweedDataset };

export function useTajweedBookData(bookId: string): TajweedBookDataState {
  const [state, setState] = useState<TajweedBookDataState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    loadTajweedDataset(bookId)
      .then((dataset) => {
        if (!cancelled) setState({ status: "ready", dataset });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "تعذّر تحميل بيانات الكتاب";
          setState({ status: "error", message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  return state;
}
