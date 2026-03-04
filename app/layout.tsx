import type { Metadata } from 'next'

import AppLayout from '@/components/AppLayout'

import './globals.css'

export const metadata: Metadata = {
  title: 'GraphQL Playground Lite',
  description:
    'Lightweight GraphQL playground with schema introspection and one-click operation generation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-primary text-text-primary antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
