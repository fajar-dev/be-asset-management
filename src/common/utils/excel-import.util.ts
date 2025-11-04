import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';

/**
 * Interface untuk menentukan konfigurasi kolom dan mapping data hasil import
 */
interface ImportOptions<T> {
    /**
     * Nama sheet yang akan diambil, default: sheet pertama
     */
    sheetName?: string;
    /**
     * Fungsi untuk mapping baris Excel menjadi object
     * @param row Row dari excel
     * @param rowNumber Nomor baris
     */
    mapRow: (row: Record<string, any>, rowNumber: number) => T;
    }

    /**
     * Utility untuk membaca dan parsing file Excel menjadi array data
     */
    export async function importFromExcel<T>(
    file: Express.Multer.File,
    options: ImportOptions<T>,
    ): Promise<T[]> {
    if (!file || !file.buffer) {
        throw new BadRequestException('File Excel tidak ditemukan');
    }

    const workbook = new ExcelJS.Workbook();

    const buffer = Buffer.from(file.buffer as Uint8Array);

    await workbook.xlsx.load(buffer as any);

    const worksheet =
        options.sheetName
        ? workbook.getWorksheet(options.sheetName)
        : workbook.worksheets[0];

    if (!worksheet) {
        throw new BadRequestException('Sheet Excel tidak ditemukan');
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
