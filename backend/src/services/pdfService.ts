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
      try {
        const parsePromise = pdfParse(buffer, {
          // Max buffer processing limits
          max: 200, // up to 200 pages
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PDF extraction timed out')), timeoutMs)
        );

        const data: any = await Promise.race([parsePromise, timeoutPromise]);
        const text = (data.text || '').trim();
        const numPages = data.numpages || 1;
        // If average characters per page is below 25, document is essentially scanned images
        const isScanned = text.length === 0 || text.length / numPages < 25;

        return {
          text: data.text || '',
          pageCount: numPages,
          isScanned,
          metadata: data.info || {},
        };
      } catch (err: any) {
        console.warn(`[PdfService] pdf-parse error for ${filename}:`, err.message);
        return {
          text: '',
          pageCount: 1,
          isScanned: true,
        };
      }
    }

    // Plain text or markdown
    const text = buffer.toString('utf-8');
    return {
      text,
      pageCount: 1,
      isScanned: false,
    };
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
