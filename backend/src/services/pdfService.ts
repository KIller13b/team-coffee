import pdfParse from 'pdf-parse';

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  metadata?: Record<string, any>;
}

export class PdfService {
  public static async extractText(buffer: Buffer, filename: string): Promise<ExtractedDocument> {
    const isPdf = filename.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      try {
        const data = await pdfParse(buffer);
        return {
          text: data.text || '',
          pageCount: data.numpages || 1,
          metadata: data.info || {},
        };
      } catch (err: any) {
        console.warn(`[PdfService] pdf-parse failed for ${filename}, falling back to raw buffer string:`, err.message);
        const rawText = buffer.toString('utf-8');
        return {
          text: rawText,
          pageCount: 1,
        };
      }
    }

    // Plain text or markdown
    const text = buffer.toString('utf-8');
    return {
      text,
      pageCount: 1,
    };
  }

  public static isLegalContract(text: string): boolean {
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
    return matches >= 3;
  }
}
