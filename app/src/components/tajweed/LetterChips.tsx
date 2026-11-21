import type { LetterSetEntity } from "../../types/entities";

export interface LetterChipsProps {
  letterSets: readonly LetterSetEntity[];
}

export function LetterChips({ letterSets }: LetterChipsProps) {
  const letters = letterSets.flatMap((letterSet) => letterSet.metadata.letters);
  if (!letters.length) return null;
  return (
    <div className="letter-set">
      {letters.map((letter, index) => (
        <span key={`${letter}-${index}`} className="letter-chip">
          {letter}
        </span>
      ))}
    </div>
  );
}
