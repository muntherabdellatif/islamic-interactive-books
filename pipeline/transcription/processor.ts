import * as fs from 'fs';
import * as path from 'path';
import { BOOK_VOLUMES } from '../../constants/pipeline';
import { TranscribedPage, BatchMetadata } from '../../types/pipeline';

/**
 * Transcribes book pages into standardized HTML templates.
 * Operates without hardcoded stage numbers to remain reusable across books.
 */
export class PageTranscriptionProcessor {
  private templateHtml: string;

  constructor(templatePath?: string) {
    const resolvedPath = templatePath || path.resolve(__dirname, '../templates/al_nashr.html');
    this.templateHtml = fs.readFileSync(resolvedPath, 'utf-8');
  }

  /**
   * Renders a single page using the book's HTML template.
   */
  public renderPageHtml(page: TranscribedPage): string {
    const footnotesHtml = page.footnotes
      .map((fn) => `<li id="fn-${fn.index}">${fn.content}</li>`)
      .join('\n        ');

    return this.templateHtml
      .replace(/{{BOOK_TITLE}}/g, page.bookTitle || BOOK_VOLUMES.AL_NASHR.DEFAULT_TITLE)
      .replace(/{{VOLUME_NUMBER}}/g, String(page.volumeNumber))
      .replace(/{{PRINTED_PAGE}}/g, String(page.printedPage))
      .replace(/{{PAGE_SEQ}}/g, String(page.pageSeq))
      .replace(/{{SECTION_TITLE}}/g, page.sectionTitle)
      .replace(/{{PAGE_CONTENT_HTML}}/g, page.bodyHtml)
      .replace(/{{PAGE_FOOTNOTES_HTML}}/g, footnotesHtml);
  }

  /**
   * Generates batch metadata for processing.
   */
  public createBatch(batchNumber: number, batchSize = 20): BatchMetadata {
    const startPage = (batchNumber - 1) * batchSize + 1;
    const endPage = Math.min(batchNumber * batchSize, BOOK_VOLUMES.AL_NASHR.TOTAL_PAGES);

    return {
      batchId: `batch-${String(batchNumber).padStart(3, '0')}`,
      startPage,
      endPage,
      totalBatchPages: endPage - startPage + 1,
      status: 'in_progress',
    };
  }

  /**
   * Saves transcribed HTML page to target output directory.
   */
  public savePageHtml(outputDir: string, page: TranscribedPage): string {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${page.pageSeq}.html`;
    const targetPath = path.join(outputDir, fileName);
    const content = this.renderPageHtml(page);

    fs.writeFileSync(targetPath, content, 'utf-8');
    return targetPath;
  }
}
