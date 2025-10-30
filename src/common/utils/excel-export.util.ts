// common/utils/excel-export.util.ts
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
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

  data.forEach((item, index) => {
    worksheet.addRow(mapRow(item, index));
  });

  // style header
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
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
