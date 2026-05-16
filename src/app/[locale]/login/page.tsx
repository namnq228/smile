'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useLogin } from '@/hooks/auth/useAuth'

interface LoginFormData {
  userName: string
  password: string
}

export default function LoginPage() {
  const t = useTranslations('Login')
  const [formData, setFormData] = useState<LoginFormData>({
    userName: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const loginMutation = useLogin(rememberMe)

  // Sync lỗi từ mutation vào local state để hiển thị
  const apiError = loginMutation.error?.message || ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.userName || !formData.password) {
      setErrorMessage(t('errorRequired'))
      return
    }

    loginMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#c3deff_0%,#d0d8f8_40%,#ddd4f5_70%,#e8d8f8_100%)]">
      {/* Left: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="relative w-full h-full max-h-screen flex items-center justify-center">
          <Image
            src="/login.png"
            alt="Login illustration"
            width={600}
            height={600}
            className="object-contain w-full h-full max-h-[85vh]"
            priority
          />
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div
          className="w-full max-w-md glass-card p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-indigo-300 pointer-events-none">
                <User size={16} />
              </span>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={formData.userName}
                onChange={handleChange}
                placeholder={t('usernamePlaceholder')}
                className="input pl-11 pr-4"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-indigo-300 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('passwordPlaceholder')}
                className="input pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-indigo-300 hover:text-indigo-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 border-indigo-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 text-base text-gray-600 select-none cursor-pointer">
                {t('rememberMe')}
              </label>
            </div>

            {/* Error */}
            {(errorMessage || apiError) && (
              <div className="rounded-xl px-4 py-3 border bg-red-100/60 backdrop-blur border-red-300/50">
                <p className="text-sm text-red-700">{errorMessage || apiError || t('errorFailed')}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full py-3 text-base"
            >
              {loginMutation.isPending ? t('submitting') : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

