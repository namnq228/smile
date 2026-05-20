'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useAppSelector } from '@/store'
import { useLogout } from '@/hooks/auth/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LOCALES = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
]

export default function Header() {
  const t = useTranslations('Header')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const user = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const { mutate: logout, isPending } = useLogout()

  if (!isAuthenticated) return null

  const initials = user?.userName
    ? user.userName.slice(0, 2).toUpperCase()
    : '?'

  const currentLocale = LOCALES.find((l) => l.value === locale)

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next })
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-background border-b">
      {/* Logo bên trái */}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-xl select-none">
        N
      </div>

      <div className="flex items-center gap-2">
        {/* Chuyển đổi ngôn ngữ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
              <span>{currentLocale?.flag}</span>
              <span className="hidden sm:inline">{currentLocale?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {LOCALES.map((l) => (
              <DropdownMenuItem
                key={l.value}
                onClick={() => switchLocale(l.value)}
                className={l.value === locale ? 'bg-accent font-medium' : 'cursor-pointer'}
              >
                <span className="mr-2">{l.flag}</span>
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar + Dropdown tài khoản */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full p-0 size-9" aria-label={t('account')}>
              <Avatar>
                <AvatarImage src={user?.userProfileImage} alt={user?.userName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {user && (
              <>
                <DropdownMenuLabel className="font-medium truncate">
                  {user.userName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isPending}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              {isPending ? t('loggingOut') : t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}


