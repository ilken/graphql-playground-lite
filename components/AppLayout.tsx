'use client'

import { useState } from 'react'

import Header from './Header'
import NavDrawer from './NavDrawer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleMenuClick = () => setIsNavOpen(true)
  const handleNavClose = () => setIsNavOpen(false)

  return (
    <div className="flex h-screen flex-col bg-primary">
      <Header onMenuClick={handleMenuClick} />
      <NavDrawer isOpen={isNavOpen} onClose={handleNavClose} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
