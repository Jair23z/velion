"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsProfileOpen(false);
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
      <nav className="flex items-center justify-between px-4 md:px-8 h-full max-w-[92%] mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-3xl md:text-4xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent"
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
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-800"
            aria-label="Abrir menú"
            onClick={() => setIsOpen((s) => !s)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {status === "loading" ? (
            <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full"></div>
          ) : session ? (
            // Usuario autenticado
            <>
              {!session.user.isPremium && (
                <Link
                  href="/pricing"
                  className="px-4 md:text-base md:block hidden py-2 border-2 border-green-600/80 text-white  hover:border-green-600 hover:text-green-600 transition text-xs text-center md:text-basic rounded-lg font-semibold"
                >
                  Hazte Premium
                </Link>
              )}
              <div ref={profileRef} className="relative">
                <button
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                  onClick={() => setIsProfileOpen((s) => !s)}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition"
                >
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
                {/* Dropdown menu (click / hover friendly) */}
                <div
                  className={`absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-200 ${isProfileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
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
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600/80 rounded hover:bg-green-600 transition text-white"
                >
                  Registrarse
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile drawer/menu */}
      <div
        className={`fixed top-20 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm transform transition-transform duration-200 md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          <Link href="/" className="text-white font-semibold py-2">Catálogo</Link>
          <Link href="/mi-lista" className="text-white font-semibold py-2">Mi Lista</Link>
          {status === 'authenticated' ? (
            <>
              <Link href="/mi-cuenta" className="w-full text-center px-4 py-3 rounded-lg bg-gray-800 text-white font-medium">Mi Cuenta</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-center px-4 py-3 rounded-lg border border-gray-700 text-red-400 font-medium">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="w-full text-center px-4 py-3 rounded-lg border border-gray-700 text-white font-medium">Iniciar Sesión</Link>
              <Link href="/register" className="w-full text-center px-4 py-3 rounded-lg bg-green-600 font-semibold text-white">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
