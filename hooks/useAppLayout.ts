import { useState } from 'react'

export const useAppLayout = () => {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleMenuClick = () => setIsNavOpen(true)
  const handleNavClose = () => setIsNavOpen(false)

  return {
    isNavOpen,
    handleMenuClick,
    handleNavClose,
  }
}
