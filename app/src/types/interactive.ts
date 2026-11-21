export interface SupplementaryExample {
  letter: string;
  letter_name_ar: string;
  word: string;
  ayah_text_ar: string;
  surah: number;
  ayah: number;
  surah_name_ar: string;
  audio_url: string;
  citation_method: string;
}

export interface RuleData {
  simplified_ar: string;
  makhraj_regions: string[];
  makhraj_note_ar: string;
  supplementary_examples: SupplementaryExample[];
}

export interface MatnExampleAudio {
  citation_method: string;
  surah: number;
  ayah: number;
  surah_name_ar: string;
  ayah_fragment_ar: string;
  audio_url: string;
}

export interface QuizQuestion {
  question_ar: string;
  choices_ar: string[];
  answer_index: number;
  explanation_ar: string;
}

export interface VideoRef {
  youtube_id: string;
  title_ar: string;
  channel_ar: string;
  note_ar?: string;
}

export interface InteractiveFile {
  book: string;
  stage: number;
  generated_at: string;
  scope_note?: string;
  riwayah_note?: string;
  makhraj_regions: Record<string, string>;
  letter_zones_note_ar?: string;
  letter_zones: Record<string, string>;
  khayshum_letters: string[];
  category_colors: Record<string, string>;
  rules: Record<string, RuleData>;
  examples_audio: Record<string, MatnExampleAudio>;
  quiz: Record<string, QuizQuestion[] | string>;
  bayt_commentary: Record<string, string>;
  chapter_videos: Record<string, VideoRef[]>;
  rule_videos: Record<string, VideoRef[]>;
}

export interface TajweedBookData {
  entitiesFile: import("./entities").EntitiesFile;
  interactiveFile: InteractiveFile;
}
