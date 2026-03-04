'use client'

import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-secondary px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded text-text-primary transition-colors hover:bg-border"
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold text-text-primary"
      >
        <Image
          src="/logo.png"
          alt="GraphQL Playground"
          width={40}
          height={40}
          className="h-8 w-auto object-contain"
        />
        GraphQL Playground
      </Link>
      <div className="w-10" />
    </header>
  )
}
