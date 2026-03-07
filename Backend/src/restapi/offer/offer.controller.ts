import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import { CreateOfferDto, UpdateOfferDto } from './offer.dto';
import { OfferService } from './offer.service';
import { AuthUser } from 'src/common/types/types';
import { RATE_LIMITS } from 'src/common/constant/constant';

@Controller('offer')
@UseGuards(ThrottlerGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

 
  @Post('create')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    const createdBy = req.user?._id ?? '';
    const offer = await this.offerService.createOffer(
      createOfferDto,
      createdBy,
    );

    return {
      message: 'Offer created successfully',
      data: offer,
    };
  }

 
  @Get('all')
  @Throttle({
    default: {
      limit: RATE_LIMITS.PUBLIC.limit,
      ttl: RATE_LIMITS.PUBLIC.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getAllOffers(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.offerService.getAllOffers(
      Number(limit),
      Number(page),
    );

    return {
      message: 'Offers fetched successfully',
      ...result,
    };
  }

 
  @Get('active')
  @Throttle({
    default: {
      limit: RATE_LIMITS.PUBLIC.limit,
      ttl: RATE_LIMITS.PUBLIC.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getActiveOffers(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.offerService.getActiveOffers(
      Number(limit),
      Number(page),
    );

    return {
      message: 'Active offers fetched successfully',
      ...result,
    };
  }


  @Get(':offer_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.PUBLIC.limit,
      ttl: RATE_LIMITS.PUBLIC.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getOfferById(@Param('offer_id') offer_id: string) {
    const offer = await this.offerService.getOfferById(offer_id);

    return {
      message: 'Offer fetched successfully',
      data: offer,
    };
  }

  
  @Patch(':offer_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async updateOffer(
    @Param('offer_id') offer_id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    const offer = await this.offerService.updateOffer(offer_id, updateOfferDto);

    return {
      message: 'Offer updated successfully',
      data: offer,
    };
  }

  
  @Delete(':offer_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async deleteOffer(@Param('offer_id') offer_id: string) {
    const offer = await this.offerService.deleteOffer(offer_id);

    return {
      message: 'Offer deleted successfully',
      data: offer,
    };
  }
}
