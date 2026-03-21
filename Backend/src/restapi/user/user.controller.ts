import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AuthUser } from 'src/common/types/types';
import { GenerateOtpDto, LoginDto, SignupDto, VerifyOtpDto } from './user.dto';
import { UserService } from './user.service';
import { UserRole } from 'src/db/schema/user.schema';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignupDto) {
    await this.userService.singUp(signUpDto);

    return {
      message:
        'User created successfully. Please verify OTP sent to your email.',
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.userService.sendOtp(generateOtpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('create-staff')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createStaff(@Body() signupDto: SignupDto) {
    const employee = await this.userService.createEmployee(signupDto);
    return {
      message: 'Employee created successfully',
      data: employee,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@Req() req: Request & { user?: AuthUser }) {
    const profile = await this.userService.getProfile(req.user?._id ?? '');

    return {
      message: 'Profile fetched successfully',
      data: profile,
    };
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  adminOnly(@Req() req: Request & { user?: Record<string, unknown> }) {
    return {
      message: 'Admin access granted',
      user: req.user ?? null,
    };
  }

  @Get('employees')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async getEmployees() {
    const employees = await this.userService.getEmployees();
    return {
      message: 'Employees fetched successfully',
      data: employees,
    };
  }

  @Get(':user_id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('user_id') user_id: string) {
    const user = await this.userService.getUserById(user_id);
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }
}
