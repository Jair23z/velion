"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('🟨 [CLIENT HEADER] Session state:', {
      status,
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      isPremium: session?.user?.isPremium,
      subscriptionPlan: session?.user?.subscriptionPlan,
      subscriptionEndDate: session?.user?.subscriptionEndDate,
      timestamp: new Date().toISOString()
    });
  }, [session, status]);

  useEffect(() => {
    const handleScroll = () => {

      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-950 shadow-lg"
          : "bg-linear-to-b from-black/80 to-transpar"
      }`}
    >
      <nav className="flex items-center justify-between px-8 h-full max-w-[92%] mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-4xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent"
          >
            VELION
          </Link>
          <div className="hidden md:flex gap-11 items-center">
            <Link
              href="/"
              className="hover:text-white text-gray-300 transition text-[17px]"
            >
              Catálogo
            </Link>
         
            <Link
              href="/mi-lista"
              className="hover:text-white text-gray-300 transition text-[17px]"
            >
              Mi Lista
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full"></div>
          ) : session ? (
            // Usuario autenticado
            <>
              {!session.user.isPremium && (
                <Link
                  href="/pricing"
                  className="px-4 py-2 border-2 border-green-600/80 text-white  hover:border-green-600 hover:text-green-600 transition text-basic rounded-lg font-semibold"
                >
                  Hazte Premium
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name!} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold">
                      {session.user?.name?.[0]?.toUpperCase() ||
                        session.user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                  {session.user.isPremium && (
                    <span className="px-2 py-0.5 bg-linear-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold rounded">
                      PREMIUM
                    </span>
                  )}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {session.user?.email}
                    </p>
                    {session.user.isPremium &&
                      session.user.subscriptionPlan && (
                        <div className="mt-2 text-xs">
                          <span className="text-yellow-500 font-semibold">
                            {session.user.subscriptionPlan}
                          </span>
                          {session.user.subscriptionEndDate && (
                            <p className="text-gray-500">
                              Vence:{" "}
                              {new Date(
                                session.user.subscriptionEndDate
                              ).toLocaleDateString("es-MX")}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                  <Link
                    href="/mi-cuenta"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    Mi Cuenta
                  </Link>
                   <Link
                    href="/mi-cuenta/suscripciones"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    Suscripciones
                  </Link>
                  <Link
                    href="/facturas"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    Facturas
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Usuario no autenticado
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-green-600/80 rounded hover:bg-green-600 transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
