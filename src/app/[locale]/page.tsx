'use client'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations()

  return (
    <div className="p-6">
      {t('Home.title')}
    </div>
  )
}
