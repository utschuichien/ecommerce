import { PartialType } from '@nestjs/swagger';
import { CreateSellerVoucherDto } from './create-seller-voucher.dto';

export class UpdateSellerVoucherDto extends PartialType(CreateSellerVoucherDto) {}

