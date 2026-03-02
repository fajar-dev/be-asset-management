import { Injectable, BadRequestException } from '@nestjs/common';
import {
  GoogleAIFileManager,
  UploadFileResponse,
} from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class GeminiService {
  private fileManager: GoogleAIFileManager;
  private googleGenerativeAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow('GEMINI_API_KEY');
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.googleGenerativeAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Parse the image for barcode data.
   * @param file The uploaded file to be processed.
   * @returns Parsed barcode data or error message if no barcode is found.
   */
  public async parseImage(file: Express.Multer.File) {
    const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.originalname}`);
    await fs.promises.writeFile(tempFilePath, file.buffer);
    try {
      const uploadResult = await this.uploadImage(tempFilePath, file.mimetype);
      return await this.generateContentFromImage(uploadResult);
    } finally {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }
  }

  /**
   * Upload the image to the Google AI File Manager.
   * @param filePath The local file path.
   * @param mimeType The file mime type.
   * @returns Upload result with file URI and MIME type.
   */
  private async uploadImage(filePath: string, mimeType: string): Promise<UploadFileResponse> {
    return this.fileManager.uploadFile(filePath, {
      mimeType: mimeType,
    });
  }

  /**
   * Generate content based on the uploaded image's barcode.
   * @param uploadResult The result of the uploaded file.
   * @returns Barcode data or error message.
   */
  private async generateContentFromImage(uploadResult: UploadFileResponse) {
    const model = this.googleGenerativeAI.getGenerativeModel({
      model: 'gemini-flash-latest',
    });

    // Get the content from the image based on the defined prompt
    const result = await model.generateContent([
      this.buildPrompt(uploadResult),
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    // Check for invalid or unclear responses
    if (this.isInvalidResponse(responseText)) {
      throw new BadRequestException("This is not a valid barcode or the content is unclear.");
    }

    return this.parseBarcodeResponse(responseText);
  }

  /**
   * Build the prompt to instruct the AI on what to do with the image.
   * @param uploadResult The result of the uploaded file.
   * @returns The prompt string for the AI model.
   */
  private buildPrompt(uploadResult: UploadFileResponse): string {
    return `
      You will receive an image that may contain a barcode. If the image is not a barcode or its content is unclear, respond with an error message: 
      - If it's not a barcode, respond with "bukan barcode".
      - If the content is unclear, respond with "tidak jelas".
      
      If the image contains a barcode, extract and return the barcode data in the following JSON format:
      {
        "barcode": string;   // The raw barcode content.
        "type": string;      // The type of barcode (e.g., "QR", "EAN", etc.)
      }

      If the image does not contain a barcode or the content is unclear, return an appropriate error message:
      "bukan barcode" or "tidak jelas".
    `;
  }

  /**
   * Check if the response is invalid, i.e., it contains error messages or is unclear.
   * @param response The model response to validate.
   * @returns True if the response is invalid.
   */
  private isInvalidResponse(response: string): boolean {
    return !response || response.includes('bukan barcode') || response.includes('tidak jelas');
  }

  /**
   * Parse the response from the AI model to extract barcode information.
   * @param response The AI model's response containing barcode data.
   * @returns The parsed barcode data in JSON format.
   */
  private parseBarcodeResponse(response: string) {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleanResponse);
      return {
        barcode: parsed.barcode || cleanResponse,
        type: parsed.type || 'UNKNOWN',
      };
    } catch (e) {
      return {
        barcode: cleanResponse,
        type: 'UNKNOWN',
      };
    }
  }
}