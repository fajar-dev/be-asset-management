import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseInterceptors } from '@nestjs/common';
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

@UseApiKey()
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
  @Roles(Role.ADMIN)
  async assign(@Body() body: AssignBookDto, @User() user: UserEntity) {
    await this.bookService.assign(user, body);
    return new ApiResponse('Book assigned successfully');
  }

  @Post('loan/return')
  @Roles(Role.ADMIN)
  async return(@Body() body: ReturnBookDto, @User() user: UserEntity) {
    await this.bookService.return(user, body);
    return new ApiResponse('Book returned successfully');
  }

  @Get('loan')
  @Roles(Role.ADMIN)
  async findAllLoans(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return new ApiResponse(
      'Employee Loan Book Data',
      await this.bookService.findAllLoans(search, startDate, endDate)
    );
  }

  @Get('loan/:employeeId')
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' },
    { originalKey: 'asset.imagePath', urlKey: 'asset.imageUrl' }
  ])
  @Serialize(ResponseBookLoanDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findLoansByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('hasReturn') hasReturn?: boolean,
  ) {
    return new ApiResponse(
      'Employee loans retrieved successfully',
      await this.bookService.findLoansByEmployee(employeeId, hasReturn)
    );
  }

  @Get(':uuid')
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseBookDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return new ApiResponse(
      'Book retrieved successfully',
      await this.bookService.findOne(uuid)
    );
  }
}
