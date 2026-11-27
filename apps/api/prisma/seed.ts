import { PrismaClient, ProductStatus, VariantStatus, VoucherScope, VoucherType } from '@prisma/client';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

// Hàm sinh publicId chuẩn ULID 26 ký tự
function genId(): string {
  return ulid();
}

// Hàm sinh mã băm ngẫu nhiên cho option_hash
function genHash(str: string): string {
  return Buffer.from(str).toString('hex').padEnd(64, '0').slice(0, 64);
}

async function main() {
  console.log('🚀 Bắt đầu nạp dữ liệu mẫu chất lượng cao (High-Quality Seed Data)...');

  // 1. Kiểm tra hoặc tạo các Danh mục (Categories) chuẩn
  const categoryDefs = [
    { name: 'Điện thoại & Phụ kiện', slug: 'phone', position: 1 },
    { name: 'Laptop & Máy tính', slug: 'laptop', position: 2 },
    { name: 'Thiết bị Âm thanh', slug: 'audio', position: 3 },
    { name: 'Thời trang & Sneaker', slug: 'fashion', position: 4 },
    { name: 'Sức khỏe & Làm đẹp', slug: 'beauty', position: 5 },
    { name: 'Đồ gia dụng & Đời sống', slug: 'home', position: 6 },
    { name: 'Thể thao & Dã ngoại', slug: 'sports', position: 7 },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoryDefs) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug, position: cat.position, isActive: true },
      update: { name: cat.name, position: cat.position, isActive: true },
    });
    categoryMap.set(cat.slug, record);
  }
  console.log(`✅ Đã đồng bộ ${categoryMap.size} danh mục sản phẩm.`);

  // 2. Kiểm tra hoặc tạo các Thương hiệu (Brands) chuẩn
  const brandDefs = [
    { name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=120' },
    { name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120' },
    { name: 'Dell', slug: 'dell', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=120' },
    { name: 'ASUS', slug: 'asus', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=120' },
    { name: 'Logitech', slug: 'logitech', logo: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120' },
    { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120' },
    { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120' },
  ];

  const brandMap = new Map<string, any>();
  for (const b of brandDefs) {
    const record = await prisma.brand.upsert({
      where: { slug: b.slug },
      create: { publicId: genId(), name: b.name, slug: b.slug, logoKey: b.logo, isActive: true },
      update: { name: b.name, logoKey: b.logo, isActive: true },
    });
    brandMap.set(b.slug, record);
  }
  console.log(`✅ Đã đồng bộ ${brandMap.size} thương hiệu.`);

  // 3. Lấy hoặc tạo Shop mặc định
  let shop = await prisma.shop.findFirst({ where: { status: 'ACTIVE' } });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        publicId: genId(),
        name: 'TechZone Official Store',
        slug: 'techzone-official',
        description: 'Gian hàng phân phối chính hãng các sản phẩm công nghệ & đời sống cao cấp.',
        status: 'ACTIVE',
        flatShippingFee: BigInt(25000),
        enableFreeShipping: true,
        freeShippingThreshold: BigInt(500000),
        dispatchTime: '24h',
      },
    });
  }
  console.log(`✅ Sử dụng Shop: ${shop.name} (id: ${shop.id})`);

  // 4. Tạo các Người đánh giá mẫu (Reviewers) để thêm review chân thực
  const reviewerDefs = [
    { email: 'hoanglong.tech@gmail.com', name: 'Hoàng Long' },
    { email: 'mainguyen.review@gmail.com', name: 'Nguyễn Thị Mai' },
    { email: 'hungtran.pro@gmail.com', name: 'Trần Văn Hùng' },
    { email: 'thanhhuong.danang@gmail.com', name: 'Lê Thanh Hương' },
  ];

  const reviewers = [];
  for (const r of reviewerDefs) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      create: {
        publicId: genId(),
        email: r.email,
        fullName: r.name,
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr', // dummy hash
        status: 'ACTIVE',
      },
      update: { fullName: r.name },
    });
    reviewers.push(user);
  }

  // 5. Danh mục 24 sản phẩm cao cấp, thực tế và hình ảnh chuẩn nét 1:1
  const productSeeds = [
    // --- ĐIỆN THOẠI & PHỤ KIỆN ---
    {
      name: 'iPhone 16 Pro Max 256GB - Titan Sa Mạc',
      slug: 'iphone-16-pro-max-256gb-desert-titanium',
      categorySlug: 'phone',
      brandSlug: 'apple',
      price: 34490000,
      oldPrice: 36990000,
      description: 'iPhone 16 Pro Max với thiết kế titan sa mạc tuyệt đẹp, nút Điều khiển camera mới, quay video 4K 120 fps chuẩn Dolby Vision và chip A18 Pro mạnh mẽ vượt trội.',
      primaryImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Titan Sa Mạc', price: 34490000, oldPrice: 36990000, sku: 'IP16PM-256-DESERT', options: { color: 'Titan Sa Mạc', capacity: '256GB' } },
        { name: 'Titan Tự Nhiên', price: 34490000, oldPrice: 36990000, sku: 'IP16PM-256-NATURAL', options: { color: 'Titan Tự Nhiên', capacity: '256GB' } },
        { name: 'Titan Đen', price: 34490000, oldPrice: 36990000, sku: 'IP16PM-256-BLACK', options: { color: 'Titan Đen', capacity: '256GB' } },
      ],
      reviews: [
        { rating: 5, comment: 'Máy cầm đầm tay, viền màn hình siêu mỏng, màu titan sa mạc bên ngoài nhìn sang chảnh hơn trong ảnh rất nhiều! Shop giao hỏa tốc 2 tiếng cực ưng ý.' },
        { rating: 5, comment: 'Hàng chính hãng VN/A check bảo hành Apple nguyên vẹn 12 tháng. Camera zoom 5x chụp nét căng, pin trâu dùng cả ngày không hết.' },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G 12GB/512GB',
      slug: 'samsung-galaxy-s24-ultra-5g-titanium',
      categorySlug: 'phone',
      brandSlug: 'samsung',
      price: 28990000,
      oldPrice: 33990000,
      description: 'Trải nghiệm đỉnh cao công nghệ với Galaxy AI, màn hình phẳng Dynamic AMOLED 2X 6.8 inch chống lóa đột phá và bút S Pen thông minh đa nhiệm.',
      primaryImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Xám Titan', price: 28990000, oldPrice: 33990000, sku: 'S24U-512-GRAY', options: { color: 'Xám Titan', capacity: '512GB' } },
        { name: 'Đen Titan', price: 28990000, oldPrice: 33990000, sku: 'S24U-512-BLACK', options: { color: 'Đen Titan', capacity: '512GB' } },
      ],
      reviews: [
        { rating: 5, comment: 'Tính năng khoanh vùng tìm kiếm Circle to Search và dịch trực tiếp cuộc gọi dùng quá tiện cho công việc! Máy dùng mượt mà, màn hình chống chói rất đỉnh.' },
      ],
    },
    {
      name: 'iPad Pro 11 inch M4 Wi-Fi 256GB',
      slug: 'ipad-pro-11-inch-m4-wifi-256gb',
      categorySlug: 'phone',
      brandSlug: 'apple',
      price: 26490000,
      oldPrice: 28990000,
      description: 'Mỏng khó tin chỉ 5.3mm với màn hình Ultra Retina XDR công nghệ Tandem OLED đột phá, chip Apple M4 đỉnh cao cho dân thiết kế đồ họa.',
      primaryImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Không Gian', price: 26490000, oldPrice: 28990000, sku: 'IPAD-M4-11-BLACK', options: { color: 'Đen Không Gian', capacity: '256GB' } },
        { name: 'Bạc', price: 26490000, oldPrice: 28990000, sku: 'IPAD-M4-11-SILVER', options: { color: 'Bạc', capacity: '256GB' } },
      ],
      reviews: [
        { rating: 5, comment: 'Màn hình OLED đen sâu tuyệt đối, vẽ Procreate siêu mượt. Máy siêu mỏng nhẹ bất ngờ.' },
      ],
    },
    {
      name: 'Đồng hồ thông minh Apple Watch Series 9 GPS 45mm',
      slug: 'apple-watch-series-9-gps-45mm',
      categorySlug: 'phone',
      brandSlug: 'apple',
      price: 9490000,
      oldPrice: 11290000,
      description: 'Tính năng chạm hai lần Double Tap độc đáo, màn hình sáng gấp đôi 2000 nits, theo dõi nồng độ oxy trong máu và điện tâm đồ chuẩn xác.',
      primaryImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Nhôm Đen Midnight', price: 9490000, oldPrice: 11290000, sku: 'AW9-45-MIDNIGHT', options: { color: 'Midnight', size: '45mm' } },
        { name: 'Nhôm Bạc Ánh Sao', price: 9490000, oldPrice: 11290000, sku: 'AW9-45-STARLIGHT', options: { color: 'Starlight', size: '45mm' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đo nhịp tim và nhắc nhở đứng dậy vận động rất chuẩn. Cử chỉ búng ngón tay trả lời cuộc gọi cực kỳ tiện lợi.' },
      ],
    },

    // --- LAPTOP & MÁY TÍNH ---
    {
      name: 'MacBook Pro 14 inch M3 Pro (18GB Unified / 512GB SSD)',
      slug: 'macbook-pro-14-m3-pro-18gb-512gb',
      categorySlug: 'laptop',
      brandSlug: 'apple',
      price: 47990000,
      oldPrice: 52990000,
      description: 'Hiệu năng đồ họa vượt trội với chip M3 Pro kiến trúc 3nm, màn hình Liquid Retina XDR 120Hz ProMotion và thời lượng pin kỷ lục lên đến 18 giờ.',
      primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Không Gian (Space Black)', price: 47990000, oldPrice: 52990000, sku: 'MBP14-M3P-BLACK', options: { color: 'Space Black', capacity: '512GB' } },
        { name: 'Bạc (Silver)', price: 47990000, oldPrice: 52990000, sku: 'MBP14-M3P-SILVER', options: { color: 'Silver', capacity: '512GB' } },
      ],
      reviews: [
        { rating: 5, comment: 'Màu Space Black chống bám vân tay tốt hơn hẳn đời trước. Render video 4K 10-bit nhanh như chớp mà máy vẫn mát rượi không hề hú quạt!' },
      ],
    },
    {
      name: 'Laptop Dell XPS 15 9530 (Core i7-13700H / 16GB / 512GB / RTX 4050)',
      slug: 'laptop-dell-xps-15-9530-rtx4050',
      categorySlug: 'laptop',
      brandSlug: 'dell',
      price: 41990000,
      oldPrice: 47990000,
      description: 'Thiết kế nhôm nguyên khối cắt CNC tinh xảo, chiếu nghỉ tay bằng sợi carbon cao cấp và màn hình OLED 3.5K sắc nét đạt 100% DCI-P3.',
      primaryImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Bạc Platinum', price: 41990000, oldPrice: 47990000, sku: 'DELL-XPS15-9530', options: { color: 'Bạc', capacity: '512GB' } },
      ],
      reviews: [
        { rating: 5, comment: 'Màn hình hiển thị màu sắc chuẩn xác phục vụ chỉnh ảnh Lightroom cực chuẩn. Bàn phím gõ êm ái, touchpad rộng rãi.' },
      ],
    },
    {
      name: 'Màn hình chuyên đồ họa Dell UltraSharp U2724D 27 inch 2K 120Hz',
      slug: 'man-hinh-dell-ultrasharp-u2724d-27-inch-2k',
      categorySlug: 'laptop',
      brandSlug: 'dell',
      price: 9890000,
      oldPrice: 11500000,
      description: 'Màn hình IPS Black đầu tiên có tần số quét 120Hz, độ tương phản 2000:1 mang lại màu đen sâu thẳm cùng chứng nhận bảo vệ mắt 4 sao TÜV Rheinland.',
      primaryImage: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Bạc Platinum 27 inch', price: 9890000, oldPrice: 11500000, sku: 'DELL-U2724D', options: { size: '27 inch', resolution: '2K 120Hz' } },
      ],
      reviews: [
        { rating: 5, comment: 'Độ tương phản IPS Black vượt trội, xem phim hay làm đồ họa màu đen sâu không bị hở sáng. Tần số quét 120Hz lướt web mượt mà.' },
      ],
    },
    {
      name: 'Bàn phím cơ không dây ASUS ROG Azoth OLED 75% Custom',
      slug: 'ban-phim-co-asus-rog-azoth-oled-75',
      categorySlug: 'laptop',
      brandSlug: 'asus',
      price: 5890000,
      oldPrice: 6590000,
      description: 'Màn hình OLED 2 inch hiển thị thông số và GIF động, 3 lớp tiêu âm silicone, switch ROG NX được lube sẵn mượt mà và kết nối 3 chế độ linh hoạt.',
      primaryImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'ROG NX Snow Switch', price: 5890000, oldPrice: 6590000, sku: 'ROG-AZOTH-SNOW', options: { switch: 'NX Snow', color: 'Gunmetal' } },
      ],
      reviews: [
        { rating: 5, comment: 'Âm thanh gõ đầm ấm, mượt mà không cần mod thêm gì. Màn hình OLED mini phía góc phải hiển thị nhiệt độ CPU cực xịn xò.' },
      ],
    },
    {
      name: 'Chuột không dây Logitech MX Master 3S Quiet Clicks 8000 DPI',
      slug: 'chuot-khong-day-logitech-mx-master-3s',
      categorySlug: 'laptop',
      brandSlug: 'logitech',
      price: 2190000,
      oldPrice: 2690000,
      description: 'Con lăn điện từ MagSpeed cuộn 1000 dòng/giây, click êm ái giảm 90% tiếng ồn và cảm biến quang học 8000 DPI di chuyển được trên mọi bề mặt kể cả kính.',
      primaryImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Graphite', price: 2190000, oldPrice: 2690000, sku: 'LOGI-MX3S-GRAPHITE', options: { color: 'Graphite' } },
        { name: 'Xám Nhạt Pale Grey', price: 2190000, oldPrice: 2690000, sku: 'LOGI-MX3S-GREY', options: { color: 'Pale Grey' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đúng chuẩn chuột công thái học số 1 cho dân văn phòng và coder. Nút bấm êm không kêu cạch cạch, cầm cả ngày không mỏi tay.' },
      ],
    },
    {
      name: 'Bàn phím cơ Custom Keychron Q1 Pro QMK/VIA Không dây',
      slug: 'ban-phim-co-keychron-q1-pro-qmk-via',
      categorySlug: 'laptop',
      brandSlug: 'logitech',
      price: 4190000,
      oldPrice: 4790000,
      description: 'Khung nhôm nguyên khối cắt CNC, thiết kế Double-Gasket êm ái và hỗ trợ tùy biến phím toàn diện qua phần mềm mã nguồn mở QMK/VIA.',
      primaryImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Carbon - Red Switch', price: 4190000, oldPrice: 4790000, sku: 'KC-Q1P-RED', options: { switch: 'K Pro Red', color: 'Carbon Black' } },
        { name: 'Trắng Sữa - Brown Switch', price: 4190000, oldPrice: 4790000, sku: 'KC-Q1P-BROWN', options: { switch: 'K Pro Brown', color: 'Shell White' } },
      ],
      reviews: [
        { rating: 5, comment: 'Bàn phím nặng gần 2kg đầm chắc, âm gõ marble thocky nghe rất thư giãn. Kết nối Bluetooth ổn định với cả Mac và Windows.' },
      ],
    },

    // --- THIẾT BỊ ÂM THANH ---
    {
      name: 'Tai nghe Bluetooth chụp tai Sony WH-1000XM5 Hi-Res Audio',
      slug: 'tai-nghe-sony-wh-1000xm5-hi-res',
      categorySlug: 'audio',
      brandSlug: 'sony',
      price: 7490000,
      oldPrice: 8990000,
      description: 'Hệ thống 8 micro cùng bộ xử lý V1 và QN1 độc quyền đem lại khả năng chống ồn hàng đầu thế giới, thời lượng pin 30 giờ và đệm tai da êm mềm.',
      primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Nhám', price: 7490000, oldPrice: 8990000, sku: 'SONY-XM5-BLACK', options: { color: 'Đen Nhám' } },
        { name: 'Bạc Silver', price: 7490000, oldPrice: 8990000, sku: 'SONY-XM5-SILVER', options: { color: 'Trắng Bạc' } },
      ],
      reviews: [
        { rating: 5, comment: 'Khử ồn xuất sắc, đeo lên quán cà phê ồn ào là như tắt âm toàn bộ thế giới xung quanh. Chất âm chi tiết, bass lực vừa đủ nghe không mệt tai.' },
      ],
    },
    {
      name: 'Tai nghe không dây Apple AirPods Pro 2 (USB-C MagSafe)',
      slug: 'tai-nghe-apple-airpods-pro-2-usbc',
      categorySlug: 'audio',
      brandSlug: 'apple',
      price: 5390000,
      oldPrice: 6190000,
      description: 'Chip H2 tân tiến mang lại chế độ Âm thanh thích ứng (Adaptive Audio), tính năng Nhận biết cuộc trò chuyện và chống ồn chủ động gấp 2 lần thế hệ trước.',
      primaryImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Trắng Chuẩn', price: 5390000, oldPrice: 6190000, sku: 'APP2-USBC-WHITE', options: { color: 'Trắng' } },
      ],
      reviews: [
        { rating: 5, comment: 'Cổng sạc Type-C dùng chung cáp với iPhone và Mac tiện lợi vô cùng. Tính năng chuyển đổi thiết bị mượt mà.' },
      ],
    },
    {
      name: 'Loa Bluetooth Marshall Stanmore III Cổ Điển Chính Hãng',
      slug: 'loa-marshall-stanmore-iii-chinh-hang',
      categorySlug: 'audio',
      brandSlug: 'sony',
      price: 8990000,
      oldPrice: 9990000,
      description: 'Thiết kế vintage huyền thoại với chất liệu da cao cấp, công suất 80W uy lực cùng dải âm trường rộng mở mang âm nhạc lấp đầy không gian phòng khách.',
      primaryImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Black Brass', price: 8990000, oldPrice: 9990000, sku: 'MS-STAN3-BLACK', options: { color: 'Black' } },
        { name: 'Trắng Kem Cream', price: 8990000, oldPrice: 9990000, sku: 'MS-STAN3-CREAM', options: { color: 'Cream' } },
      ],
      reviews: [
        { rating: 5, comment: 'Vừa là loa nghe nhạc bass ấm treble sáng, vừa làm món đồ decor phòng khách cực kỳ sang trọng. Bạn bè đến chơi ai cũng khen.' },
      ],
    },
    {
      name: 'Loa di động chống nước JBL Charge 5 (40W RMS, Pin 20h)',
      slug: 'loa-di-dong-jbl-charge-5-chong-nuoc',
      categorySlug: 'audio',
      brandSlug: 'sony',
      price: 3390000,
      oldPrice: 3990000,
      description: 'Chuẩn chống bụi nước IP67 bền bỉ, màng rung thụ động kép tăng cường âm trầm JBL Original Pro Sound và kiêm sạc dự phòng cho điện thoại.',
      primaryImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Quyền Lực', price: 3390000, oldPrice: 3990000, sku: 'JBL-CHG5-BLACK', options: { color: 'Black' } },
        { name: 'Xanh Rằn Ri Camo', price: 3390000, oldPrice: 3990000, sku: 'JBL-CHG5-CAMO', options: { color: 'Camo' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đem đi cắm trại hoặc tiệc bể bơi ngoài trời thì hết bài! Pin trâu bò nghe từ sáng đến tối chưa cạn.' },
      ],
    },

    // --- THỜI TRANG & SNEAKER ---
    {
      name: "Giày Sneaker Nike Air Force 1 '07 All White",
      slug: 'giay-nike-air-force-1-07-all-white',
      categorySlug: 'fashion',
      brandSlug: 'nike',
      price: 2690000,
      oldPrice: 3290000,
      description: 'Huyền thoại bóng rổ đường phố với chất liệu da thật cao cấp, đệm khí Nike Air êm ái và phối màu trắng thanh lịch dễ dàng phối đồ với mọi phong cách.',
      primaryImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Trắng - Size 40', price: 2690000, oldPrice: 3290000, sku: 'AF1-WHITE-40', options: { size: '40', color: 'White' } },
        { name: 'Trắng - Size 41', price: 2690000, oldPrice: 3290000, sku: 'AF1-WHITE-41', options: { size: '41', color: 'White' } },
        { name: 'Trắng - Size 42', price: 2690000, oldPrice: 3290000, sku: 'AF1-WHITE-42', options: { size: '42', color: 'White' } },
        { name: 'Trắng - Size 43', price: 2690000, oldPrice: 3290000, sku: 'AF1-WHITE-43', options: { size: '43', color: 'White' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đôi giày quốc dân bất tử với thời gian. Form giày cứng cáp, đi êm chân, hàng chuẩn chính hãng có hộp nguyên vẹn.' },
      ],
    },
    {
      name: 'Giày chạy bộ chuyên nghiệp Nike Pegasus 41 ReactX',
      slug: 'giay-chay-bo-nike-pegasus-41-reactx',
      categorySlug: 'fashion',
      brandSlug: 'nike',
      price: 3290000,
      oldPrice: 3890000,
      description: 'Bọt đệm ReactX mới tăng 13% khả năng hoàn trả năng lượng, lưới dệt kỹ thuật thoáng khí giúp giảm nhiệt hiệu quả trên từng cung đường chạy dài.',
      primaryImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đỏ Volt - Size 41', price: 3290000, oldPrice: 3890000, sku: 'PEG41-RED-41', options: { size: '41', color: 'Volt Red' } },
        { name: 'Đỏ Volt - Size 42', price: 3290000, oldPrice: 3890000, sku: 'PEG41-RED-42', options: { size: '42', color: 'Volt Red' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đệm êm nảy, chạy cự ly 10km không hề đau gót hay nhức gan bàn chân. Màu sắc thể thao bắt mắt.' },
      ],
    },
    {
      name: 'Giày Sneaker thời trang Adidas Samba OG Cloud White',
      slug: 'giay-adidas-samba-og-cloud-white',
      categorySlug: 'fashion',
      brandSlug: 'nike',
      price: 2490000,
      oldPrice: 2990000,
      description: 'Mũi giày chữ T bọc da lộn đặc trưng, đế cao su gum bám đường và 3 sọc răng cưa biểu tượng tạo nên phong cách retro thanh lịch.',
      primaryImage: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Trắng Sọc Đen - Size 41', price: 2490000, oldPrice: 2990000, sku: 'SAMBA-WHT-41', options: { size: '41', color: 'Cloud White' } },
        { name: 'Trắng Sọc Đen - Size 42', price: 2490000, oldPrice: 2990000, sku: 'SAMBA-WHT-42', options: { size: '42', color: 'Cloud White' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đang hot trend diện quần ống suông hay short đều đẹp hết nấc. Hàng chuẩn xịn xò 10/10.' },
      ],
    },
    {
      name: 'Balo laptop công nghệ chống nước Mark Ryden MR9031',
      slug: 'balo-laptop-chong-nuoc-mark-ryden-mr9031',
      categorySlug: 'fashion',
      brandSlug: 'xiaomi',
      price: 820000,
      oldPrice: 1150000,
      description: 'Chất liệu vải Oxford chống thấm nước tuyệt đối, tích hợp cổng sạc USB thông minh, ngăn ẩn chống trộm và ngăn đựng laptop 15.6 inch bọc đệm êm ái.',
      primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Carbon', price: 820000, oldPrice: 1150000, sku: 'MR-9031-BLACK', options: { color: 'Black' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đựng vừa laptop 15.6 inch và đầy đủ sạc, chuột, sổ tay. Đi mưa nhẹ nước trượt như lá khoai không sợ ướt máy tính.' },
      ],
    },

    // --- ĐỒ GIA DỤNG & ĐỜI SỐNG ---
    {
      name: 'Robot hút bụi lau nhà thông minh Dreame L10s Ultra Tự Giặt Giẻ',
      slug: 'robot-hut-bui-dreame-l10s-ultra-tu-giat-gie',
      categorySlug: 'home',
      brandSlug: 'xiaomi',
      price: 14490000,
      oldPrice: 18990000,
      description: 'Lực hút 5300Pa siêu mạnh mẽ, trạm sạc toàn năng tự động giặt và sấy khô giẻ lau bằng khí nóng, tự bổ sung nước và tự động đổ rác 60 ngày.',
      primaryImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Trắng Tinh Tế', price: 14490000, oldPrice: 18990000, sku: 'DREAME-L10S-WHT', options: { color: 'White' } },
      ],
      reviews: [
        { rating: 5, comment: 'Cứu cánh cho gia đình có con nhỏ và nuôi thú cưng! Tự động hút bụi rồi giặt giẻ sạch bong, sàn nhà lúc nào cũng sạch bóng kin kít.' },
      ],
    },
    {
      name: 'Nồi chiên không dầu điện tử Philips HD9280/90 Dung tích 6.2L',
      slug: 'noi-chien-khong-dau-philips-hd9280-90-6-2l',
      categorySlug: 'home',
      brandSlug: 'xiaomi',
      price: 2690000,
      oldPrice: 3590000,
      description: 'Công nghệ Rapid Air lốc xoáy giảm đến 90% dầu mỡ, kết nối ứng dụng NutriU thông minh điều khiển qua điện thoại và dung tích 6.2L chiên gà nguyên con.',
      primaryImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Bóng 6.2L', price: 2690000, oldPrice: 3590000, sku: 'PHILIPS-HD9280', options: { capacity: '6.2L', color: 'Black' } },
      ],
      reviews: [
        { rating: 5, comment: 'Nướng thịt ngoài giòn trong mọng nước không hề bị khô. Nồi chống dính tốt, dễ tháo rửa vệ sinh.' },
      ],
    },
    {
      name: 'Đèn bàn học làm việc chống cận thị Xiaomi Mi LED Desk Lamp 1S',
      slug: 'den-ban-hoc-chong-can-xiaomi-lamp-1s',
      categorySlug: 'home',
      brandSlug: 'xiaomi',
      price: 590000,
      oldPrice: 790000,
      description: 'Chỉ số hoàn màu Ra95 tiệm cận ánh sáng mặt trời tự nhiên, không nhấp nháy quang học bảo vệ thị lực và điều chỉnh độ sáng/nhiệt độ màu qua núm xoay kim loại.',
      primaryImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Trắng Tinh Khiết', price: 590000, oldPrice: 790000, sku: 'MI-LAMP-1S-WHT', options: { color: 'White' } },
      ],
      reviews: [
        { rating: 5, comment: 'Thiết kế tối giản tuyệt đẹp chuẩn phong cách Bắc Âu. Ánh sáng dịu mắt làm việc đêm đỡ mỏi mắt hẳn.' },
      ],
    },

    // --- SỨC KHỎE & LÀM ĐẸP ---
    {
      name: 'Bàn chải điện sóng âm thông minh Oral-B iO Series 9 Cảm Biến AI',
      slug: 'ban-chai-dien-oral-b-io-series-9-ai',
      categorySlug: 'beauty',
      brandSlug: 'xiaomi',
      price: 4690000,
      oldPrice: 5690000,
      description: 'Công nghệ rung từ tính êm ái kết hợp đầu tròn xoay lắc độc quyền, cảm biến lực nhấn thông minh báo đèn LED tránh tổn thương nướu và theo dõi 16 vùng răng 3D.',
      primaryImage: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Đen Onyx Black', price: 4690000, oldPrice: 5690000, sku: 'ORALB-IO9-BLACK', options: { color: 'Onyx Black' } },
      ],
      reviews: [
        { rating: 5, comment: 'Đánh răng xong cảm giác sạch bong mảng bám như vừa đi lấy cao răng ở nha khoa về. Rất đáng đồng tiền bát gạo!' },
      ],
    },
    {
      name: 'Máy cạo râu điện 3 lưỡi kép khô & ướt Philips Series 5000',
      slug: 'may-cao-rau-dien-philips-series-5000',
      categorySlug: 'beauty',
      brandSlug: 'xiaomi',
      price: 1590000,
      oldPrice: 2190000,
      description: 'Lưỡi cạo tự mài SteelPrecision 90.000 nhát cắt/phút, đầu cạo uốn cong 360 độ linh hoạt bám sát từng góc cạnh khuôn mặt và rửa sạch dưới vòi nước.',
      primaryImage: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { name: 'Xanh Đậm Midnight', price: 1590000, oldPrice: 2190000, sku: 'PHILIPS-S5000-BLU', options: { color: 'Midnight Blue' } },
      ],
      reviews: [
        { rating: 5, comment: 'Cạo sạch nhẵn râu mà không hề bị rát da hay xước da. Pin dùng cả tháng mới phải sạc 1 lần.' },
      ],
    },
  ];

  // 5.5. Dọn dẹp các sản phẩm mẫu cũ (dummy products 14-21) chưa hoàn chỉnh
  const legacyProductIds = [14n, 15n, 16n, 17n, 18n, 19n, 20n, 21n];
  for (const legId of legacyProductIds) {
    const leg = await prisma.product.findUnique({
      where: { id: legId },
      include: { variants: true },
    });
    if (leg) {
      for (const v of leg.variants) {
        await prisma.inventory.deleteMany({ where: { variantId: v.id } });
        await prisma.cartItem.deleteMany({ where: { variantId: v.id } });
      }
      await prisma.productVariant.deleteMany({ where: { productId: leg.id } });
      await prisma.productImage.deleteMany({ where: { productId: leg.id } });
      await prisma.wishlistItem.deleteMany({ where: { productId: leg.id } });
      await prisma.review.deleteMany({ where: { productId: leg.id } });
      await prisma.product.delete({ where: { id: leg.id } });
    }
  }

  // 6. Nạp từng sản phẩm, biến thể, hình ảnh, tồn kho và review
  let insertedCount = 0;
  for (const prodData of productSeeds) {
    const category = categoryMap.get(prodData.categorySlug) || Array.from(categoryMap.values())[0];
    const brand = brandMap.get(prodData.brandSlug) || null;

    // Kiểm tra xem sản phẩm đã có trong Shop chưa theo slug
    let product = await prisma.product.findFirst({
      where: { shopId: shop.id, slug: prodData.slug },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          publicId: genId(),
          shopId: shop.id,
          categoryId: category.id,
          brandId: brand ? brand.id : null,
          name: prodData.name,
          slug: prodData.slug,
          description: prodData.description,
          searchText: `${prodData.name} ${brand?.name || ''} ${category.name}`.toLowerCase(),
          status: ProductStatus.ACTIVE,
          minPrice: BigInt(prodData.price),
        },
      });
      insertedCount++;
    } else {
      // Cập nhật giá & thông tin mới nhất
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: prodData.name,
          description: prodData.description,
          minPrice: BigInt(prodData.price),
          status: ProductStatus.ACTIVE,
        },
      });
    }

    // 6.1. Tạo hình ảnh sản phẩm
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < prodData.galleryImages.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          storageKey: prodData.galleryImages[i],
          alt: `${prodData.name} - Ảnh ${i + 1}`,
          position: i,
          isPrimary: i === 0,
        },
      });
    }

    // 6.2. Tạo các biến thể & Tồn kho thực tế
    for (const v of prodData.variants) {
      const optionHash = genHash(JSON.stringify(v.options));
      let variant = await prisma.productVariant.findFirst({
        where: { productId: product.id, optionHash },
      });

      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            publicId: genId(),
            productId: product.id,
            shopId: shop.id,
            sku: `${v.sku}-${product.id}`,
            optionValues: v.options,
            optionHash,
            price: BigInt(v.price),
            compareAtPrice: BigInt(v.oldPrice),
            status: VariantStatus.ACTIVE,
          },
        });
      } else {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { price: BigInt(v.price), compareAtPrice: BigInt(v.oldPrice) },
        });
      }

      // Tồn kho thực tế: 65 sản phẩm sẵn sàng bán
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          shopId: shop.id,
          onHand: 65,
          reserved: 2,
          lowStockThreshold: 5,
        },
        update: { onHand: 65 },
      });
    }

    // 6.3. Tạo các đánh giá sao thực tế (Reviews)
    for (let rIdx = 0; rIdx < prodData.reviews.length; rIdx++) {
      const reviewItem = prodData.reviews[rIdx];
      const reviewer = reviewers[rIdx % reviewers.length];

      // Đảm bảo có 1 đơn hàng đã hoàn tất để review hợp lệ
      let mockOrder = await prisma.order.findFirst({
        where: { userId: reviewer.id, status: 'COMPLETED' },
      });
      if (!mockOrder) {
        mockOrder = await prisma.order.create({
          data: {
            publicId: genId(),
            orderNumber: `ORD-RV-${reviewer.id}-${Date.now().toString().slice(-6)}`,
            userId: reviewer.id,
            status: 'COMPLETED',
            subtotal: BigInt(prodData.price),
            discountTotal: BigInt(0),
            shippingTotal: BigInt(0),
            grandTotal: BigInt(prodData.price),
            currency: 'VND',
            contactEmail: reviewer.email,
            contactPhone: '0901234567',
            shippingAddress: { address: 'Hồ Chí Minh, Việt Nam', recipient: reviewer.fullName },
            expiresAt: new Date(Date.now() + 86400000),
            paidAt: new Date(),
          },
        });
      }

      // Upsert Review
      const existingReview = await prisma.review.findFirst({
        where: { userId: reviewer.id, productId: product.id, orderId: mockOrder.id },
      });
      if (!existingReview) {
        await prisma.review.create({
          data: {
            publicId: genId(),
            userId: reviewer.id,
            productId: product.id,
            orderId: mockOrder.id,
            rating: reviewItem.rating,
            comment: reviewItem.comment,
            isVerified: true,
          },
        });
      }
    }
  }
  console.log(`✅ Đã nạp và cập nhật thành công ${productSeeds.length} sản phẩm thực tế kèm tồn kho & đánh giá sao.`);

  // 7. Tạo các mã Giảm giá (Vouchers / Coupons) cho sàn và shop
  const voucherDefs = [
    {
      code: 'COMMERCEOS10',
      name: 'Giảm 10% đơn hàng công nghệ',
      description: 'Giảm 10% tối đa 200.000đ cho đơn hàng từ 500.000đ',
      type: VoucherType.PERCENTAGE,
      discountValue: BigInt(10),
      maxDiscountAmount: BigInt(200000),
      minOrderValue: BigInt(500000),
      scope: VoucherScope.GLOBAL,
    },
    {
      code: 'FREESHIP50',
      name: 'Miễn phí vận chuyển 50k',
      description: 'Giảm 50.000đ phí giao hàng cho đơn từ 300.000đ',
      type: VoucherType.FIXED_AMOUNT,
      discountValue: BigInt(50000),
      maxDiscountAmount: BigInt(50000),
      minOrderValue: BigInt(300000),
      scope: VoucherScope.GLOBAL,
    },
    {
      code: 'TECHZONE100',
      name: 'Voucher TechZone tri ân 100k',
      description: 'Giảm trực tiếp 100.000đ cho đơn mua tại TechZone từ 1.000.000đ',
      type: VoucherType.FIXED_AMOUNT,
      discountValue: BigInt(100000),
      maxDiscountAmount: BigInt(100000),
      minOrderValue: BigInt(1000000),
      scope: VoucherScope.SHOP,
      shopId: shop.id,
    },
    {
      code: 'HELLONEW',
      name: 'Ưu đãi thành viên mới',
      description: 'Giảm ngay 50.000đ cho đơn hàng đầu tiên từ 200.000đ',
      type: VoucherType.FIXED_AMOUNT,
      discountValue: BigInt(50000),
      maxDiscountAmount: BigInt(50000),
      minOrderValue: BigInt(200000),
      scope: VoucherScope.GLOBAL,
    },
  ];

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 2);

  for (const v of voucherDefs) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      create: {
        publicId: genId(),
        code: v.code,
        name: v.name,
        description: v.description,
        scope: v.scope,
        shopId: v.shopId || null,
        type: v.type,
        discountValue: v.discountValue,
        maxDiscountAmount: v.maxDiscountAmount || null,
        minOrderValue: v.minOrderValue,
        usageLimit: 5000,
        usedCount: 0,
        usagePerUser: 1,
        startDate: now,
        endDate: nextYear,
        isActive: true,
      },
      update: {
        name: v.name,
        description: v.description,
        discountValue: v.discountValue,
        minOrderValue: v.minOrderValue,
        isActive: true,
      },
    });
  }
  console.log(`✅ Đã nạp ${voucherDefs.length} mã voucher giảm giá (COMMERCEOS10, FREESHIP50, TECHZONE100, HELLONEW).`);

  console.log('🎉 Hoàn tất quá trình nạp dữ liệu mẫu (Seed Data) thành công rực rỡ!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
