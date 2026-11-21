import { useCallback, useRef, useState } from "react";

export type AudioPlaybackStatus = "idle" | "playing" | "error";

export interface AudioPlayer {
  playingKey: string | null;
  statusFor: (key: string) => AudioPlaybackStatus;
  toggle: (url: string, key: string) => void;
}

/** Plays one streamed recitation clip at a time (per-example "key"), replacing AudioView.js. */
export function useAudioPlayer(): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingKey(null);
  }, []);

  const toggle = useCallback(
    (url: string, key: string) => {
      if (!url) return;
      if (playingKey === key) {
        stop();
        return;
      }
      stop();
      setErrorKey(null);
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingKey(key);
      audio.addEventListener("ended", stop);
      audio.addEventListener("error", () => {
        setErrorKey(key);
        stop();
      });
      audio.play().catch(() => {
        setErrorKey(key);
        stop();
      });
    },
    [playingKey, stop],
  );

  const statusFor = useCallback(
    (key: string): AudioPlaybackStatus => {
      if (playingKey === key) return "playing";
      if (errorKey === key) return "error";
      return "idle";
    },
    [playingKey, errorKey],
  );

  return { playingKey, statusFor, toggle };
}
