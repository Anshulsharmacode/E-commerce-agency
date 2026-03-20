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
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import { CreateOfferDto, UpdateOfferDto } from './offer.dto';
import { OfferService } from './offer.service';
import { AuthUser } from 'src/common/types/types';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('create')
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
  @HttpCode(HttpStatus.OK)
  async getAllOffers() {
    const offers = await this.offerService.getAllOffers();

    return {
      message: 'Offers fetched successfully',
      data: offers,
    };
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  async getActiveOffers() {
    const offers = await this.offerService.getActiveOffers();

    return {
      message: 'Active offers fetched successfully',
      data: offers,
    };
  }

  @Get('eligible')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getEligibleOffers(@Req() req: Request & { user?: AuthUser }) {
    const offers = await this.offerService.getEligibleOffersForCart(
      req.user?._id ?? '',
    );

    return {
      message: 'Eligible offers fetched successfully',
      data: offers,
    };
  }

  @Get(':offer_id')
  @HttpCode(HttpStatus.OK)
  async getOfferById(@Param('offer_id') offer_id: string) {
    const offer = await this.offerService.getOfferById(offer_id);

    return {
      message: 'Offer fetched successfully',
      data: offer,
    };
  }

  @Patch(':offer_id')
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
