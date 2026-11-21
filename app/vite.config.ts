import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { AVAILABLE_BOOK_IDS } from "./src/constants/books";

const bookDataCopyTargets = AVAILABLE_BOOK_IDS.flatMap((bookId) => [
  { src: `../data/books/${bookId}/html/*.html`, dest: `data/${bookId}/html` },
  { src: `../data/books/${bookId}/images/*.webp`, dest: `data/${bookId}/images` },
  { src: `../data/books/${bookId}/entities.json`, dest: `data/${bookId}` },
  { src: `../data/books/${bookId}/interactive.json`, dest: `data/${bookId}` },
]);

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: bookDataCopyTargets,
    }),
  ],
  server: {
    fs: {
      allow: [".."],
    },
  },
});
