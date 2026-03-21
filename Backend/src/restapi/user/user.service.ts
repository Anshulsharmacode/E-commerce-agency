import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole, Otp } from 'src/db/schema/index';
import { GenerateOtpDto, LoginDto, SignupDto, VerifyOtpDto } from './user.dto';
import { comparePassword, hashedPassword } from 'src/utills/utills';
import { apiError } from 'src/utills/apiResponse';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Otp.name)
    private readonly otpModel: Model<Otp>,
    private readonly jwtService: JwtService,
  ) {}

  async singUp(singUp: SignupDto) {
    const { name, email, phone, password, address } = singUp;

    if (!name || !email || !phone || !password || !address) {
      apiError('Missing fields', null, HttpStatus.BAD_REQUEST);
    }
    const alreadyExist = await this.userModel.findOne({ email });

    if (alreadyExist) {
      throw new ForbiddenException('user already exits');
    }

    const hashPassword = await hashedPassword(password);

    try {
      const user = await this.userModel.create({
        name: name,
        email: email,
        phone: phone,
        password: hashPassword,
        address: address,
        role: UserRole.USER,
        is_active: false,
      });

      await this.sendOtp({ emailOrPhone: email });
      return user;
    } catch (error: unknown) {
      apiError('error in created user ', error);
    }
  }

  async createEmployee(signupDto: SignupDto) {
    const { name, email, phone, password, address } = signupDto;

    const alreadyExist = await this.userModel.findOne({ email });
    if (alreadyExist) {
      throw new ForbiddenException('Employee already exists');
    }

    const hashPassword = await hashedPassword(password);

    try {
      return await this.userModel.create({
        name: name,
        email: email,
        phone: phone,
        password: hashPassword,
        address: address,
        role: UserRole.EMPLOYEE,
        is_active: true, // Employee might be active by default if created by admin
      });
    } catch (error: unknown) {
      apiError('Error creating employee', error);
    }
  }

  async sendOtp(generateOtpDto: GenerateOtpDto) {
    const { emailOrPhone } = generateOtpDto;
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry

    await this.otpModel.findOneAndUpdate(
      { emailOrPhone },
      { otp, expiry },
      { upsert: true, returnDocument: 'after' },
    );

    console.log(`OTP for ${emailOrPhone} is ${otp}`); // In real app, send via SMS/Email
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { emailOrPhone, otp } = verifyOtpDto;

    const otpRecord = await this.otpModel.findOne({ emailOrPhone });

    if (!otpRecord) {
      throw new BadRequestException('OTP not sent or expired');
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > otpRecord.expiry) {
      throw new BadRequestException('OTP expired');
    }

    // OTP is valid, activate user
    const user = await this.userModel.findOneAndUpdate(
      { $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
      { is_active: true },
      { returnDocument: 'after' },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete OTP record after successful verification
    await this.otpModel.deleteOne({ _id: otpRecord._id });

    return { message: 'OTP verified successfully' };
  }

  async login(logindto: LoginDto) {
    const { email, password } = logindto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Please verify your account first');
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      email: email,
      token,
    };
  }

  async getProfile(user_id: string) {
    if (!user_id) {
      throw new UnauthorizedException('User not found in token');
    }

    const user = await this.userModel.findById(user_id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getEmployees() {
    return this.userModel
      .find({ role: UserRole.EMPLOYEE })
      .select('-password')
      .sort({ created_at: -1 });
  }

  async getUserById(user_id: string) {
    if (!user_id) {
      throw new UnauthorizedException('User id is required');
    }

    const user = await this.userModel.findById(user_id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
