import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import '../../styles/globals.scss'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { setRequestLocale } from 'next-intl/server'
import QueryProvider from '@/libs/reactQueryClient'
import ReduxProvider from '@/libs/ReduxProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'NamNQ',
  description: 'hihi',
}

type RootLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <NextIntlClientProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </NextIntlClientProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}

export async function generateStaticParams() {
  return ['en', 'vi'].map((locale) => ({ locale }));
}