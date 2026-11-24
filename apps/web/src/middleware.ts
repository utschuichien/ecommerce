import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các route bắt buộc phải đăng nhập
const PROTECTED_ROUTES = [
  '/profile',
  '/checkout',
  '/account',
  '/seller',
  '/admin',
];

// Danh sách các route chỉ dành cho khách (chưa đăng nhập)
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Kiểm tra trạng thái đăng nhập qua cookies
  const hasAuth =
    request.cookies.has('is_authenticated') ||
    request.cookies.has('access_token');

  // 1. Kiểm tra các trang yêu cầu đăng nhập (Protected Routes)
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    // Lưu lại URL trước đó để sau khi đăng nhập thì redirect về
    const destination = `${pathname}${search}`;
    loginUrl.searchParams.set('redirect', destination);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Nếu đã đăng nhập mà truy cập trang /login hoặc /register thì redirect về trang chủ (hoặc destination)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthRoute && hasAuth) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Áp dụng middleware cho tất cả các route ngoại trừ:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico, file tĩnh có đuôi (.png, .jpg, .svg, .webp, v.v.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
