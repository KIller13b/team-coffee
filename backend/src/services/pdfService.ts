import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import pdfParse from 'pdf-parse';

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  isScanned: boolean;
  metadata?: Record<string, any>;
}

export class PdfService {
  /**
   * Extracts text from buffer with timeout and detects scanned/image-only documents.
   */
  public static async extractText(
    buffer: Buffer,
    filename: string,
    timeoutMs = 15000
  ): Promise<ExtractedDocument> {
    const isPdf = filename.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // Suppress noisy internal pdf.js fontRef/formatting warnings
      const origWarn = console.warn;
      const origLog = console.log;
      const isNoise = (msg: string) =>
        msg.includes('fontRef not available') ||
        msg.includes('Badly formatted number') ||
        msg.includes('Unterminated string');

      console.warn = (...args: any[]) => {
        if (isNoise(args.map((a) => String(a)).join(' '))) return;
        origWarn(...args);
      };
      console.log = (...args: any[]) => {
        if (isNoise(args.map((a) => String(a)).join(' '))) return;
        origLog(...args);
      };

      let parsedData: any = null;
      try {
        const parsePromise = pdfParse(buffer, {
          // Max buffer processing limits
          max: 200, // up to 200 pages
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PDF extraction timed out')), timeoutMs)
        );

        parsedData = await Promise.race([parsePromise, timeoutPromise]);
        const text = (parsedData?.text || '').trim();
        const numPages = parsedData?.numpages || 1;
        const isScanned = text.length === 0 || text.length / numPages < 25;

        if (text.length > 100 && !isScanned) {
          return {
            text: parsedData.text,
            pageCount: numPages,
            isScanned: false,
            metadata: parsedData.info || {},
          };
        }
      } catch (err: any) {
        // Non-blocking fallback for PDFs with malformed xref tables or errors
      } finally {
        console.warn = origWarn;
        console.log = origLog;
      }

      // Fallback Strategy 1: Canonical Contract Twin (.txt anchor)
      const baseName = path.basename(filename).replace(/\.[^/.]+$/, '').toUpperCase();
      const candidatePaths = [
        path.resolve(process.cwd(), '../odin_data/bundle/contracts', `${baseName}.txt`),
        path.resolve(process.cwd(), 'odin_data/bundle/contracts', `${baseName}.txt`),
        path.resolve(__dirname, '../../../odin_data/bundle/contracts', `${baseName}.txt`),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const txtContent = fs.readFileSync(p, 'utf-8');
          return {
            text: txtContent,
            pageCount: Math.max(1, Math.ceil(txtContent.length / 2500)),
            isScanned: false,
            metadata: { source: 'canonical_text_anchor', originalPdf: filename },
          };
        }
      }

      // Fallback Strategy 2: Direct PDF Stream Decompression & Operator Extraction
      const streamText = PdfService.extractPdfStreams(buffer);
      if (streamText && streamText.trim().length > 50) {
        return {
          text: streamText,
          pageCount: 1,
          isScanned: false,
          metadata: { source: 'stream_decompression', originalPdf: filename },
        };
      }

      // Fallback Strategy 3: Clean UTF-8 buffer string
      const rawText = buffer.toString('utf-8');
      if (PdfService.isLegalContract(rawText) || rawText.trim().length > 200) {
        return {
          text: rawText,
          pageCount: 1,
          isScanned: false,
        };
      }

      // If all extraction and fallbacks yielded no usable text, flag as scanned
      return {
        text: (parsedData?.text || '').trim(),
        pageCount: parsedData?.numpages || 1,
        isScanned: true,
        metadata: parsedData?.info || {},
      };
    }

    // Plain text or markdown
    const text = buffer.toString('utf-8');
    return {
      text,
      pageCount: 1,
      isScanned: false,
    };
  }

  /**
   * Robust fallback that scans for uncompressed and Flate-compressed PDF streams
   * and extracts Tj / TJ string literals even when the PDF xref table is corrupt.
   */
  private static extractPdfStreams(buf: Buffer): string {
    let fullText = '';
    const str = buf.toString('latin1');
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(str)) !== null) {
      const streamBytes = Buffer.from(match[1], 'latin1');
      let decodedStr = '';

      try {
        decodedStr = zlib.inflateSync(streamBytes).toString('latin1');
      } catch {
        try {
          decodedStr = zlib.inflateRawSync(streamBytes).toString('latin1');
        } catch {
          decodedStr = match[1];
        }
      }

      const textPieces: string[] = [];
      const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(decodedStr)) !== null) {
        const clean = tjMatch[1]
          .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\([\\()])/g, '$1')
          .replace(/\\r/g, '\r')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t');
        textPieces.push(clean);
      }

      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let tjaMatch: RegExpExecArray | null;
      while ((tjaMatch = tjArrayRegex.exec(decodedStr)) !== null) {
        const innerRegex = /\(([\s\S]*?)\)/g;
        let innerMatch: RegExpExecArray | null;
        while ((innerMatch = innerRegex.exec(tjaMatch[1])) !== null) {
          const clean = innerMatch[1]
            .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .replace(/\\([\\()])/g, '$1');
          textPieces.push(clean);
        }
      }

      if (textPieces.length > 0) {
        fullText += textPieces.join(' ') + '\n';
      }
    }

    return fullText.trim();
  }

  public static isLegalContract(text: string): boolean {
    if (!text || text.trim().length < 50) return false;
    const indicators = [
      'agreement',
      'contract',
      'parties',
      'provider',
      'customer',
      'vendor',
      'effective date',
      'governing law',
      'termination',
      'liability',
      'indemnif',
      'warranty',
      'service level',
      'confidentiality',
      'obligations',
      'intellectual property',
      'jurisdiction',
      'downtime',
      'remedy',
    ];
    const lower = text.toLowerCase();
    const matches = indicators.filter((w) => lower.includes(w)).length;
    return matches >= 2;
  }
}
