/**
 * Plays per-ayah Quran recitation audio (streamed, never downloaded) for example words.
 * Reciter: Husary (Mu'allim, Hafs 'an 'Asim). See interactive.json's riwayah_note.
 */
const AudioView = (() => {
  let currentAudio = null;
  let currentBtn = null;

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentBtn) {
      currentBtn.classList.remove("playing");
      currentBtn.textContent = "▶";
      currentBtn = null;
    }
  }

  function playUrl(url, key, btn) {
    if (!url) return;
    if (currentBtn === btn) {
      stop();
      return;
    }
    stop();
    currentAudio = new Audio(url);
    currentBtn = btn;
    btn.classList.add("playing");
    btn.textContent = "⏸";
    currentAudio.addEventListener("ended", stop);
    currentAudio.addEventListener("error", () => {
      btn.textContent = "⚠️";
      stop();
    });
    currentAudio.play().catch(() => { btn.textContent = "⚠️"; stop(); });
  }

  function playFor(exampleId, btn) {
    const audio = Data.audioFor(exampleId);
    if (!audio) return;
    playUrl(audio.audio_url, exampleId, btn);
  }

  return { playFor, playUrl, stop };
})();
