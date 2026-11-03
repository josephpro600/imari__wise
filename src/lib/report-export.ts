import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Language } from '@/types/finance';

export interface ReportSection {
  heading: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ReportData {
  title: string;
  periodLabel: string;
  summaryRows: [string, string][];
  sections: ReportSection[];
}

function baseDoc(title: string, periodLabel: string): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(title, 40, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(110);
  doc.text(periodLabel, 40, 70);
  doc.setTextColor(0);
  return doc;
}

export function exportPdf(data: ReportData) {
  const doc = baseDoc(data.title, data.periodLabel);
  let cursorY = 100;

  autoTable(doc, {
    startY: cursorY,
    head: [['', '']],
    body: data.summaryRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 11, cellPadding: 6 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 220 } },
    margin: { left: 40, right: 40 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 28;

  for (const section of data.sections) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    if (cursorY > 720) {
      doc.addPage();
      cursorY = 50;
    }
    doc.text(section.heading, 40, cursorY);
    cursorY += 8;
    autoTable(doc, {
      startY: cursorY,
      head: [section.columns],
      body: section.rows,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: 40, right: 40 },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  doc.save('imariwise-report.pdf');
}

export function exportExcel(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    [data.title],
    [data.periodLabel],
    [],
    ...data.summaryRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  for (const section of data.sections) {
    const sheet = XLSX.utils.aoa_to_sheet([section.columns, ...section.rows]);
    const safeName = section.heading.replace(/[^A-Za-z0-9]/g, '').slice(0, 28) || 'Sheet';
    XLSX.utils.book_append_sheet(workbook, sheet, safeName);
  }

  XLSX.writeFile(workbook, 'imariwise-report.xlsx');
}

export type { Language };
