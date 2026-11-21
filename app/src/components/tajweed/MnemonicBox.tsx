import type { MnemonicEntity } from "../../types/entities";

export interface MnemonicBoxProps {
  mnemonics: readonly MnemonicEntity[];
}

export function MnemonicBox({ mnemonics }: MnemonicBoxProps) {
  if (!mnemonics.length) return null;
  return (
    <>
      {mnemonics.map((mnemonic) => (
        <div key={mnemonic.id} className="mnemonic-box">
          <span className="chip">رمز</span> <span className="phrase">{mnemonic.metadata.phrase}</span>
          {mnemonic.metadata.note_ar ? <div className="mnemonic-note">{mnemonic.metadata.note_ar}</div> : null}
        </div>
      ))}
    </>
  );
}
