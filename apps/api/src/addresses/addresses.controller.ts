import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiTags('Addresses')
@ApiBearerAuth('access-token')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('mine')
  @ApiOperation({ summary: 'List the authenticated customer’s saved addresses' })
  listMine(@Request() req: AuthRequest) {
    return this.addressesService.listMine(req.user.sub);
  }

  @Post()
  @ApiBody({ type: CreateAddressDto })
  @ApiOperation({ summary: 'Save a customer delivery address and optional coordinates' })
  create(@Request() req: AuthRequest, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(req.user.sub, dto);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateAddressDto })
  @ApiOperation({ summary: 'Update one of the authenticated customer’s addresses' })
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of the authenticated customer’s addresses' })
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.addressesService.remove(req.user.sub, id);
  }
}
