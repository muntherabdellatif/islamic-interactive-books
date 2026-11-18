/**
 * Pipeline TypeScript Types & Interfaces
 */

export interface PageFootnote {
  index: number;
  content: string;
}

export interface TranscribedPage {
  pageSeq: number;
  volumeNumber: number;
  printedPage: number;
  sectionTitle: string;
  bookTitle: string;
  bodyHtml: string;
  footnotes: PageFootnote[];
}

export interface BatchMetadata {
  batchId: string;
  startPage: number;
  endPage: number;
  totalBatchPages: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  reviewer?: string;
  approvedAt?: string;
}
