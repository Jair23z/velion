import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación
  const protectedPaths = ['/facturacion', '/mi-cuenta', '/mi-lista', '/checkout'];
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  
  if (requiresAuth) {
    // Verificar si hay token de sesión en las cookies
    const sessionToken = request.cookies.get('authjs.session-token') || 
                        request.cookies.get('__Secure-authjs.session-token');
    
    if (!sessionToken) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|invoices).*)'],
};
