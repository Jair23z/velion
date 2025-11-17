import React from "react";


export default function ErrorMessage({children}: {children: React.ReactNode}) {
    return (
        <div className="text-red-600 text-[12px] mt-2 flex items-center gap-1">
            <svg 
                className="w-4 h-4 shrink-0" 
                fill="none"
                stroke="currentColor"
                viewBox="0 0 20 20"
            >
                <circle cx="10" cy="10" r="8" strokeWidth="1.5"/>
                <path d="M7 7l6 6M13 7l-6 6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {children}
        </div>
    )
}
