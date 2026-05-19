import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Các path không cần đăng nhập (không có locale prefix)
const PUBLIC_PATHS = ['/login']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')?.value

  // Xác định locale và path thực sự
  const locales = routing.locales as readonly string[]
  const segments = pathname.split('/')
  const hasLocale = locales.includes(segments[1])
  const locale = hasLocale ? segments[1] : routing.defaultLocale
  const pathWithoutLocale = hasLocale ? '/' + segments.slice(2).join('/') : pathname

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/')
  )

  // Chưa đăng nhập → redirect về login
  if (!token && !isPublic) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Đã đăng nhập mà vào trang login → redirect về trang chủ
  if (token && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
