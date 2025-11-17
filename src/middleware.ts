import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnPurchase = req.nextUrl.pathname.startsWith("/purchase");
  // Removemos /watch para permitir preview de 15 segundos sin sesión
  const isOnMyPurchases = req.nextUrl.pathname.startsWith("/my-purchases");
  // Las facturas descargables (PDF/XML) deben ser públicas para QR
  // const isOnInvoices = req.nextUrl.pathname.startsWith("/invoices");
  const isOnFacturacion = req.nextUrl.pathname.startsWith("/facturacion");

  const requiresAuth = isOnPurchase || isOnMyPurchases || isOnFacturacion;

  if (requiresAuth && !isLoggedIn) {
    const callbackUrl = req.nextUrl.pathname;
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    );
  }

  return;
});

export const config = {
  // Excluir /invoices de la autenticación (para servir PDFs públicos)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|invoices).*)"],
};
