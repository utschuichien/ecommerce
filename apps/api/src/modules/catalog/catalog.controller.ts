import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RateLimit } from '../../platform/decorators/rate-limit.decorator';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục động kèm số lượng sản phẩm' })
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Lấy danh sách thương hiệu động (lọc theo danh mục nếu có)' })
  @ApiQuery({ name: 'category', required: false, description: 'Slug hoặc ID của danh mục' })
  async getBrands(@Query('category') category?: string) {
    return this.catalogService.getBrands(category);
  }

  @RateLimit({
    points: 30,
    duration: 60,
    message: 'Bạn đang tìm kiếm sản phẩm quá nhanh. Vui lòng chậm lại một chút.',
  })
  @Get('products')
  @ApiOperation({ summary: 'Tìm kiếm, lọc đa chiều và phân trang danh mục sản phẩm' })
  async getProducts(@Query() query: CatalogQueryDto) {
    return this.catalogService.getProducts(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo Slug' })
  async getProductDetail(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
