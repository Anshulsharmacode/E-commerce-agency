import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { GenerateOtpDto, LoginDto, SignupDto, VerifyOtpDto } from './user.dto';
import { UserService } from './user.service';
import { UserRole } from 'src/db/schema/user.schema';
import { RATE_LIMITS } from 'src/common/constant/constant';

@Controller('user')
@UseGuards(ThrottlerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Post('signup')
  @Throttle({
    default: {
      limit: RATE_LIMITS.AUTH.limit,
      ttl: RATE_LIMITS.AUTH.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignupDto) {
    await this.userService.singUp(signUpDto);

    return {
      message:
        'User created successfully. Please verify OTP sent to your email.',
    };
  }

 
  @Post('verify-otp')
  @Throttle({
    default: {
      limit: RATE_LIMITS.AUTH.limit,
      ttl: RATE_LIMITS.AUTH.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyOtpDto);
  }

 
  @Post('resend-otp')
  @Throttle({
    default: {
      limit: RATE_LIMITS.AUTH.limit,
      ttl: RATE_LIMITS.AUTH.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.userService.sendOtp(generateOtpDto);
  }

  
  @Post('login')
  @Throttle({
    default: {
      limit: RATE_LIMITS.AUTH.limit,
      ttl: RATE_LIMITS.AUTH.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  
  @Post('create-staff')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
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
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard)
  profile(@Req() req: Request & { user?: Record<string, unknown> }) {
    return {
      message: 'Profile fetched successfully',
      user: req.user ?? null,
    };
  }

  @Get('admin')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  adminOnly(@Req() req: Request & { user?: Record<string, unknown> }) {
    return {
      message: 'Admin access granted',
      user: req.user ?? null,
    };
  }
}
