'use client'

import Link from 'next/link'

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/', label: 'Playground' },
  { href: '/endpoints', label: 'Manage Endpoints' },
]

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50"
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-border bg-secondary transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-semibold text-text-primary">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded text-text-primary transition-colors hover:bg-border"
            aria-label="Close menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded px-3 py-2 text-text-primary transition-colors hover:bg-accent-blue hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
