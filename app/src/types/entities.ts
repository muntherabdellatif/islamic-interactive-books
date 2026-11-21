export type EntityType =
  | "chapter"
  | "bayt"
  | "tajweed_rule"
  | "definition"
  | "letter_set"
  | "mnemonic"
  | "example_word"
  | "person"
  | "document_section";

export interface EntityAnchor {
  page: number;
  block_id: string;
  line?: number;
  quote?: string;
}

export interface EntityRelations {
  children?: string[];
  parent?: string[];
  topic?: string[];
  mnemonic?: string[];
  mnemonic_for?: string[];
  example?: string[];
  examples?: string[];
  example_of?: string[];
  counter_example_of?: string[];
  letters?: string[];
  applies_to_letters?: string[];
  exceptions?: string[];
  combines?: string[];
}

export interface ChapterMetadata {
  order: number;
  bayt_count_marker: number | null;
  bayt_range: [number, number];
  stated_count?: number | null;
}

export interface BaytMetadata {
  number: number;
  shatr1_text: string;
  shatr2_text: string;
  chapter_id: string;
}

export interface TajweedRuleMetadata {
  category: string;
  description_ar: string;
  stated_count?: number | null;
}

export interface DefinitionMetadata {
  term: string;
  definition_ar: string;
}

export interface LetterSetMetadata {
  letters: string[];
  count: number;
  note_ar?: string;
}

export interface MnemonicMetadata {
  phrase: string;
  decode_method: string;
  decoded_letters: string[];
  note_ar?: string;
}

export interface ExampleWordMetadata {
  word: string;
  source: string;
  surah_ayah: [number, number] | null;
}

export interface PersonMetadata {
  name_ar: string;
  role: string;
  dates?: string;
}

export interface DocumentSectionMetadata {
  kind: string;
  summary_ar: string;
}

export type EntityMetadata =
  | ChapterMetadata
  | BaytMetadata
  | TajweedRuleMetadata
  | DefinitionMetadata
  | LetterSetMetadata
  | MnemonicMetadata
  | ExampleWordMetadata
  | PersonMetadata
  | DocumentSectionMetadata;

export interface BookEntity<
  TType extends EntityType = EntityType,
  TMetadata extends EntityMetadata = EntityMetadata,
> {
  id: string;
  type: TType;
  label_ar: string;
  anchors: EntityAnchor[];
  metadata: TMetadata;
  relations?: EntityRelations;
}

export type ChapterEntity = BookEntity<"chapter", ChapterMetadata>;
export type BaytEntity = BookEntity<"bayt", BaytMetadata>;
export type TajweedRuleEntity = BookEntity<"tajweed_rule", TajweedRuleMetadata>;
export type DefinitionEntity = BookEntity<"definition", DefinitionMetadata>;
export type LetterSetEntity = BookEntity<"letter_set", LetterSetMetadata>;
export type MnemonicEntity = BookEntity<"mnemonic", MnemonicMetadata>;
export type ExampleWordEntity = BookEntity<"example_word", ExampleWordMetadata>;
export type PersonEntity = BookEntity<"person", PersonMetadata>;
export type DocumentSectionEntity = BookEntity<"document_section", DocumentSectionMetadata>;

export interface EntityTypeMap {
  chapter: ChapterEntity;
  bayt: BaytEntity;
  tajweed_rule: TajweedRuleEntity;
  definition: DefinitionEntity;
  letter_set: LetterSetEntity;
  mnemonic: MnemonicEntity;
  example_word: ExampleWordEntity;
  person: PersonEntity;
  document_section: DocumentSectionEntity;
}

export interface EntitiesFile {
  book: string;
  stage: number;
  generated_at: string;
  scope_note?: string;
  entities: BookEntity[];
}
