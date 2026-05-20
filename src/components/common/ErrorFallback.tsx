'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'

interface Props {
  error: Error | null
  onReset: () => void
  boundaryTag?: string
}

/**
 * UI hiển thị khi ErrorBoundary bắt được lỗi.
 * Tách riêng để dùng được hook (useTranslations, useRouter).
 */
export default function ErrorFallback({ error, onReset, boundaryTag }: Props) {
  const t = useTranslations('ErrorBoundary')
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive text-3xl">
        ⚠
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{t('description')}</p>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 max-w-lg w-full rounded-md bg-muted px-4 py-3 text-left text-xs text-muted-foreground space-y-1">
          {boundaryTag && (
            <p className="font-semibold text-foreground">
              📍 Boundary: <code>{boundaryTag}</code>
            </p>
          )}
          {error && <pre className="overflow-auto">{error.message}</pre>}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={onReset}>
          {t('retry')}
        </Button>
        <Button onClick={() => router.push('/')}>
          {t('goHome')}
        </Button>
      </div>
    </div>
  )
}
