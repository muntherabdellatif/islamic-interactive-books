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

function playIcon(player: AudioPlayer, key: string): string {
  const status = player.statusFor(key);
  if (status === "playing") return "⏸";
  if (status === "error") return "⚠️";
  return "▶";
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
          const parts = example.ayah_text_ar.split(example.word);
          return (
            <div key={key} className="example-row example-row-full">
              <button
                type="button"
                className="play-btn"
                title="استماع"
                onClick={() => audioPlayer.toggle(example.audio_url, key)}
              >
                {playIcon(audioPlayer, key)}
              </button>
              <div className="example-ayah-text">
                {parts.map((part, partIndex) => (
                  <span key={partIndex}>
                    {part}
                    {partIndex < parts.length - 1 ? <mark className="rule-hl">{example.word}</mark> : null}
                  </span>
                ))}
              </div>
              <span className="citation">
                سورة {example.surah_name_ar} {example.surah}:{example.ayah}
                {example.letter ? ` — حرف ${example.letter_name_ar || example.letter}` : ""}
              </span>
            </div>
          );
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
