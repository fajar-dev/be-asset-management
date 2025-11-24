import * as ExcelJS from 'exceljs';
import { Response } from 'express';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  isHyperlink?: boolean;
}

interface ExportOptions<T> {
  fileName: string;
  sheetName: string;
  columns: ExportColumn[];
  data: T[];
  mapRow: (item: T, index: number) => Record<string, any>;
}

export async function exportToExcel<T>(
  res: Response,
  options: ExportOptions<T>,
): Promise<void> {
  const { fileName, sheetName, columns, data, mapRow } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  const hyperlinkColumns = columns
    .map((col, index) => (col.isHyperlink ? { key: col.key, index } : null))
    .filter((item): item is { key: string; index: number } => item !== null);

  data.forEach((item, index) => {
    const rowData = mapRow(item, index);
    const row = worksheet.addRow(rowData);

    hyperlinkColumns.forEach(({ key, index: colIndex }) => {
      const cell = row.getCell(colIndex + 1);
      const url = rowData[key];

      if (url && url !== '-' && typeof url === 'string') {
        // Encode double slash untuk hyperlink
        const encodedUrl = url.replace(
          /(https?:\/\/)(.+)/,
          (match, protocol, path) => {
            const encodedPath = path.replace(/\/\//g, '/%2F');
            return protocol + encodedPath;
          }
        );

        // ✅ Tampilkan "View Image" sebagai text, bukan URL lengkap
        cell.value = {
          text: 'View Image',     // Text yang ditampilkan
          hyperlink: encodedUrl,  // URL yang sebenarnya
        };
        
        cell.font = {
          color: { argb: 'FF0563C1' },
          underline: true,
        };
        cell.alignment = { 
          vertical: 'middle',
          horizontal: 'center',  // Center align untuk "View Image"
        };
      } else {
        // Jika tidak ada URL, tampilkan "-"
        cell.value = '-';
        cell.alignment = { 
          vertical: 'middle',
          horizontal: 'center',
        };
      }
    });
  });

  // Header styling
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  worksheet.eachRow((row) => {
    row.height = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fileName}.xlsx"`,
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.send(buffer);
}