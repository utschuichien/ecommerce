import { Response } from 'express';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: '/api/v1/auth',
  });
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, 
    path: '/',
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('refresh_token', { path: '/api/v1/auth' });
  res.clearCookie('access_token', { path: '/' });
}
