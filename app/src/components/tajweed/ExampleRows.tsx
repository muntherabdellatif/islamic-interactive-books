import { useState } from "react";
import type { TajweedDataset } from "../../services/tajweedDataService";
import type { ExampleWordEntity } from "../../types/entities";
import type { SupplementaryExample } from "../../types/interactive";
import { matnExampleAudio } from "../../services/tajweedSelectors";
import type { AudioPlayer } from "../../hooks/useAudioPlayer";

export interface ExampleRowsProps {
  dataset: TajweedDataset;
  matnExamples: readonly ExampleWordEntity[];
  supplementary: readonly SupplementaryExample[];
  audioPlayer: AudioPlayer;
}

const EXCERPT_CONTEXT_WORDS = 4;

function playIcon(player: AudioPlayer, key: string): string {
  const status = player.statusFor(key);
  if (status === "playing") return "⏸";
  if (status === "error") return "⚠️";
  return "▶";
}

/** The few words immediately around the shahid (evidence word), not the whole ayah —
 *  a 40+ word ayah like al-Ra'd 13:33 otherwise buries the one word being taught. */
function excerptAroundWord(
  ayahText: string,
  word: string,
): { before: string; after: string; truncatedBefore: boolean; truncatedAfter: boolean } {
  const idx = ayahText.indexOf(word);
  if (idx === -1) return { before: "", after: "", truncatedBefore: false, truncatedAfter: false };
  const beforeWords = ayahText.slice(0, idx).trim().split(/\s+/).filter(Boolean);
  const afterWords = ayahText
    .slice(idx + word.length)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const before = beforeWords.slice(-EXCERPT_CONTEXT_WORDS).join(" ");
  const after = afterWords.slice(0, EXCERPT_CONTEXT_WORDS).join(" ");
  return {
    before,
    after,
    truncatedBefore: beforeWords.length > EXCERPT_CONTEXT_WORDS,
    truncatedAfter: afterWords.length > EXCERPT_CONTEXT_WORDS,
  };
}

interface SupplementaryAyahRowProps {
  example: SupplementaryExample;
  rowKey: string;
  audioPlayer: AudioPlayer;
}

function SupplementaryAyahRow({ example, rowKey, audioPlayer }: SupplementaryAyahRowProps) {
  const [expanded, setExpanded] = useState(false);
  const excerpt = excerptAroundWord(example.ayah_text_ar, example.word);
  const parts = example.ayah_text_ar.split(example.word);

  return (
    <div className="example-row example-row-full">
      <button
        type="button"
        className="play-btn"
        title="استماع"
        onClick={() => audioPlayer.toggle(example.audio_url, rowKey)}
      >
        {playIcon(audioPlayer, rowKey)}
      </button>
      <div className="example-ayah-text">
        {expanded ? (
          parts.map((part, partIndex) => (
            <span key={partIndex}>
              {part}
              {partIndex < parts.length - 1 ? <mark className="rule-hl">{example.word}</mark> : null}
            </span>
          ))
        ) : (
          <span>
            {excerpt.truncatedBefore ? "… " : ""}
            {excerpt.before}
            {excerpt.before ? " " : ""}
            <mark className="rule-hl">{example.word}</mark>
            {excerpt.after ? " " : ""}
            {excerpt.after}
            {excerpt.truncatedAfter ? " …" : ""}
          </span>
        )}
        <button type="button" className="ayah-expand-toggle" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "اختصار" : "الآية كاملة"}
        </button>
      </div>
      <span className="citation">
        سورة {example.surah_name_ar} {example.surah}:{example.ayah}
        {example.letter ? ` — حرف ${example.letter_name_ar || example.letter}` : ""}
      </span>
    </div>
  );
}

export function ExampleRows({ dataset, matnExamples, supplementary, audioPlayer }: ExampleRowsProps) {
  const hasAny = matnExamples.length > 0 || supplementary.length > 0;
  if (!hasAny) {
    return <p className="no-examples-note">لا تتوفر أمثلة صوتية إضافية موثّقة لهذا الحكم بعد.</p>;
  }

  return (
    <>
      {matnExamples.map((example) => {
        const audio = matnExampleAudio(dataset, example.id);
        const isCounterExample = (example.relations?.counter_example_of?.length ?? 0) > 0;
        const citation = audio ? `${audio.surah_name_ar} ${audio.surah}:${audio.ayah}` : "مثال من المتن";
        return (
          <div key={example.id} className="example-row">
            {audio ? (
              <button
                type="button"
                className="play-btn"
                title="استماع"
                onClick={() => audioPlayer.toggle(audio.audio_url, example.id)}
              >
                {playIcon(audioPlayer, example.id)}
              </button>
            ) : (
              <span className="play-btn play-btn-disabled">–</span>
            )}
            <span className="word">{example.metadata.word}</span>
            {isCounterExample ? <span className="chip badge-warning">استثناء</span> : null}
            <span className="citation">{citation}</span>
          </div>
        );
      })}
      {supplementary.map((example, index) => {
        const key = `supp-${index}`;
        if (example.ayah_text_ar) {
          return <SupplementaryAyahRow key={key} example={example} rowKey={key} audioPlayer={audioPlayer} />;
        }
        return (
          <div key={key} className="example-row">
            <button
              type="button"
              className="play-btn"
              title="استماع"
              onClick={() => audioPlayer.toggle(example.audio_url, key)}
            >
              {playIcon(audioPlayer, key)}
            </button>
            <span className="word">{example.word}</span>
            <span className="citation">
              {example.surah_name_ar} {example.surah}:{example.ayah}
            </span>
          </div>
        );
      })}
    </>
  );
}
