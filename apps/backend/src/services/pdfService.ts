import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { IResult } from '../models/Result';

// Use standard PDF fonts (Times = authentic exam paper)
const fonts = {
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

const printer = new PdfPrinter(fonts);

interface PdfOptions {
  schoolName: string;
  schoolLocation: string;
  result: IResult;
  showDifficulty?: boolean;
}

export function generateQuestionPaperPDF({ schoolName, schoolLocation, result, showDifficulty = false }: PdfOptions): Buffer {
  const content: Content[] = [
    // ── School Header ──────────────────────────────────────────────────
    {
      text: `${schoolName}, ${schoolLocation}`,
      style: 'schoolHeader',
      alignment: 'center',
      margin: [0, 0, 0, 4],
    },
    {
      text: `Subject: ${result.subject}`,
      style: 'subHeader',
      alignment: 'center',
    },
    {
      text: `Class: ${result.grade.replace(/class/i, '').trim()}`,
      style: 'subHeader',
      alignment: 'center',
      margin: [0, 0, 0, 8],
    },

    // ── Time / Marks Row ───────────────────────────────────────────────
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
    {
      columns: [
        { text: `Time Allowed: ${result.duration} minutes`, style: 'meta' },
        { text: `Maximum Marks: ${result.totalMarks}`, style: 'meta', alignment: 'right' },
      ],
      margin: [0, 6, 0, 6],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },

    // ── General Instruction ────────────────────────────────────────────
    {
      text: 'All questions are compulsory unless stated otherwise.',
      style: 'boldInstruction',
      margin: [0, 10, 0, 12],
    },

    // ── Student Info ───────────────────────────────────────────────────
    {
      stack: [
        {
          columns: [
            { text: 'Name: ', style: 'label', width: 50 },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 210, y2: 8, lineWidth: 0.5 }], width: 210 },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          columns: [
            { text: 'Roll Number: ', style: 'label', width: 75 },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 185, y2: 8, lineWidth: 0.5 }], width: 185 },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          columns: [
            { text: `Class: ${result.grade.replace(/class/i, '').trim()}   Section: `, style: 'label', width: 110 },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 150, y2: 8, lineWidth: 0.5 }], width: 150 },
          ],
          margin: [0, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 16],
    },

    // ── Sections ───────────────────────────────────────────────────────
    ...result.sections.flatMap((section): Content[] => {
      const marksPerQ = section.questions[0]?.marks || 0;
      const calcText = `(${section.questions.length} × ${marksPerQ} = ${section.totalMarks} Marks)`;

      const questionItems: Content[] = section.questions.map((q) => ({
        text: [
          { text: `${q.questionNumber}. `, bold: true },
          ...(showDifficulty ? [{ text: `[${q.difficulty}] `, color: '#555555' }] : []),
          { text: q.questionText },
          { text: `  [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`, bold: true },
        ],
        margin: [0, 0, 0, 6],
        style: 'questionText',
      }));

      // MCQ options
      const questionsWithOptions: Content[] = section.questions.flatMap((q): Content[] => {
        if (!q.options || q.options.length === 0) return [];
        return [
          {
            columns: q.options.map((opt) => ({ text: opt, width: '25%', style: 'optionText' })),
            margin: [16, -4, 0, 6],
          },
        ];
      });

      // Interleave questions with their options
      const questionBlock: Content[] = section.questions.flatMap((q): Content[] => {
        const qItem: Content = {
          text: [
            { text: `${q.questionNumber}. `, bold: true },
            ...(showDifficulty ? [{ text: `[${q.difficulty}] `, color: '#555555' }] : []),
            { text: q.questionText },
            { text: `  [${q.marks} Mark${q.marks > 1 ? 's' : ''}]`, bold: true },
          ],
          margin: [0, 0, 0, 4],
          style: 'questionText',
        };

        if (q.options && q.options.length > 0) {
          const optRow: Content = {
            columns: q.options.map((opt) => ({ text: opt, width: '25%', style: 'optionText' })),
            margin: [16, 0, 0, 8],
          };
          return [qItem, optRow];
        }
        return [qItem];
      });

      return [
        {
          text: `Section ${section.sectionName}`,
          style: 'sectionTitle',
          alignment: 'center',
          margin: [0, 12, 0, 4],
        },
        {
          text: `${section.title} ${calcText}`,
          style: 'questionType',
          margin: [0, 0, 0, 2],
        },
        {
          text: section.instruction,
          italics: true,
          style: 'instruction',
          margin: [0, 0, 0, 8],
        },
        ...questionBlock,
      ];
    }),

    // ── End of Paper ───────────────────────────────────────────────────
    {
      text: '— End of Question Paper —',
      alignment: 'center',
      bold: true,
      margin: [0, 16, 0, 16],
      style: 'meta',
    },

    // ── Answer Key ─────────────────────────────────────────────────────
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] },
    {
      text: 'Answer Key',
      style: 'questionType',
      margin: [0, 10, 0, 6],
    },
    ...result.sections.flatMap((section) =>
      section.questions
        .filter((q) => q.answer)
        .map((q): Content => ({
          text: [
            { text: `${q.questionNumber}. `, bold: true },
            { text: q.answer ?? '' },
          ],
          style: 'answerText',
          margin: [0, 0, 0, 4],
        }))
    ),
  ];

  const docDefinition: TDocumentDefinitions = {
    content,
    defaultStyle: {
      font: 'Times',
      fontSize: 11,
      lineHeight: 1.3,
    },
    styles: {
      schoolHeader: { fontSize: 16, bold: true },
      subHeader: { fontSize: 12, bold: true },
      meta: { fontSize: 11 },
      boldInstruction: { fontSize: 11, bold: true },
      label: { fontSize: 11 },
      sectionTitle: { fontSize: 14, bold: true },
      questionType: { fontSize: 12, bold: true },
      instruction: { fontSize: 10, color: '#444444' },
      questionText: { fontSize: 11 },
      optionText: { fontSize: 10.5 },
      answerText: { fontSize: 10.5, color: '#333333' },
    },
    pageMargins: [50, 50, 50, 50],
    pageSize: 'A4',
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  }) as unknown as Buffer;
}

export async function generatePDFAsync(options: PdfOptions): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const result = generateQuestionPaperPDF(options);
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        resolve(result);
      }
    } catch (err) {
      reject(err);
    }
  });
}
