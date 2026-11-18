/**
 * Centralized Constants for Pipeline & Ingestion
 */

export const BATCH_SIZE = 20;

export const BOOK_VOLUMES = {
  AL_NASHR: {
    VOL_1_PAGES: 510,
    VOL_2_PAGES: 475,
    TOTAL_PAGES: 985,
    DEFAULT_TITLE: 'النشر في القراءات العشر',
    AUTHOR: 'ابن الجزري (ت 833 هـ)',
  },
} as const;

export const STAGE_NAMES = {
  LAYOUT_TRANSCRIPTION: 'layout_transcription',
  ENTITY_EXTRACTION: 'entity_extraction',
  ENTITY_RESOLUTION: 'entity_resolution',
  INTERACTIVE_BUILDER: 'interactive_builder',
} as const;

export const STATUS_TYPES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
