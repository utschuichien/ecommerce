import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { ShopProductsQueryDto } from './dto';
import { Public } from '../../platform/decorators/public.decorator';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các gian hàng công khai đang hoạt động',
  })
  async getPublicShops(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shopsService.getPublicShops({ search, page, limit });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Lấy thông tin công khai của gian hàng (Shop Profile)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug hoặc Public ID của cửa hàng',
    example: 'apple-flagship-store',
  })
  async getPublicShopProfile(@Param('slug') slug: string) {
    return this.shopsService.getPublicShopProfile(slug);
  }

  @Public()
  @Get(':slug/products')
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm thuộc gian hàng (kèm bộ lọc type-safe, tìm kiếm, phân trang)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug hoặc Public ID của cửa hàng',
    example: 'apple-flagship-store',
  })
  async getPublicShopProducts(
    @Param('slug') slug: string,
    @Query() query: ShopProductsQueryDto,
  ) {
    return this.shopsService.getPublicShopProducts(slug, query);
  }
}
