import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';

/**
 * Interface for defining column configuration and mapping imported data
 */
interface ImportOptions<T> {
    /**
     * The name of the worksheet to read from, default: the first sheet
     */
    sheetName?: string;

    /**
     * Function to map each Excel row into an object
     * @param row Row data from the Excel sheet
     * @param rowNumber The row number
     */
    mapRow: (row: Record<string, any>, rowNumber: number) => T;
}

/**
 * Utility function to read and parse an Excel file into an array of data
 */
export async function importFromExcel<T>(
    file: Express.Multer.File,
    options: ImportOptions<T>,
    ): Promise<T[]> {
    if (!file || !file.buffer) {
        throw new BadRequestException('Excel file not found');
    }

    const workbook = new ExcelJS.Workbook();
    const buffer = Buffer.from(file.buffer as Uint8Array);
    await workbook.xlsx.load(buffer as any);

    const worksheet = options.sheetName
        ? workbook.getWorksheet(options.sheetName)
        : workbook.worksheets[0];

    if (!worksheet) {
        throw new BadRequestException('Excel sheet not found');
    }

    const headers: string[] = [];
    const data: T[] = [];

    worksheet.eachRow((row, rowNumber) => {
        const values = row.values as (string | number | null)[];

        if (rowNumber === 1) {
        headers.push(
            ...values.slice(1).map((v) => (v ? String(v).trim() : '')),
        );
        return;
        }

        const rowObj: Record<string, any> = {};
        headers.forEach((key, idx) => {
        rowObj[key] = values[idx + 1] ?? null;
        });

        const mapped = options.mapRow(rowObj, rowNumber);
        data.push(mapped);
    });

    return data;
}
