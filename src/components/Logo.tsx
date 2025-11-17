'use client';
import Link from 'next/link';

export const Logo = () => {
    return (
        <Link href="/" className="text-4xl md:text-5xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
            VELION
        </Link>
    );
};
