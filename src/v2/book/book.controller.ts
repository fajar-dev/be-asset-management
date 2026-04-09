import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ResponseBookDto } from './dto/response-book.dto';
import { ResponseBookLoanDto } from './dto/response-book-loan.dto';
import { ResponseEmployeeLoanDto } from './dto/response-employee-loan.dto';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { PreSignedUrl } from '../../common/decorator/presigned-url.decorator';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../../v1/user/entities/user.entity';
import { AssignBookDto } from './dto/assign-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../../v1/user/enum/role.enum';
import { UseApiKey } from '../../common/decorator/api-key.decorator';
import { watermarkImage } from '../../common/utils/image-watermark.util';

@Controller()
export class BookController {
  constructor(private readonly bookService: BookService) {}
  
  @Get()
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseBookDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findAll(
    @Query('search') search?: string,
    @Query('hasHolder') hasHolder?: boolean,
    @Query('branchId') branchId?: string,
  ) {
    return new ApiResponse(
      'Books retrieved successfully',
      await this.bookService.findAll(search, hasHolder, branchId)
    );
  }

  @Post('loan/assign')
  @UseInterceptors(FileInterceptor('image'))
  async assign(
    @Body() body: AssignBookDto,
    @User() user: UserEntity,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    const watermarkedImage = await watermarkImage(image);
    body.attachments = [watermarkedImage];

    await this.bookService.assign(user.id, body.assetId, user, body);
    return new ApiResponse('Book assigned successfully');
  }

  @Post('loan/return')
  @UseInterceptors(FileInterceptor('image'))
  async return(
    @Body() body: ReturnBookDto,
    @User() user: UserEntity,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    const watermarkedImage = await watermarkImage(image);
    body.attachments = [watermarkedImage];

    await this.bookService.return(user.id, body.assetHolderId, user, body);
    return new ApiResponse('Book returned successfully');
  }

  @UseApiKey()
  @Get('loan')
  @Roles(Role.ADMIN)
  async findAllLoans(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('hasReturn') hasReturn?: boolean,
  ) {
    return new ApiResponse(
      'Employee Loan Book Data',
      await this.bookService.findAllLoans(search, startDate, endDate, hasReturn)
    );
  }

  @Get('loan/by-user')
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' },
    { originalKey: 'asset.imagePath', urlKey: 'asset.imageUrl' }
  ])
  @Serialize(ResponseBookLoanDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findLoansByEmployee(@User() user: UserEntity) {
    return new ApiResponse(
      'User loans retrieved successfully',
      await this.bookService.findLoansByEmployee(user.employeeId)
    );
  }

  @Get(':code')
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseBookDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findOne(@Param('code') code: string) {
    return new ApiResponse(
      'Book retrieved successfully',
      await this.bookService.findOne(code)
    );
  }
}
