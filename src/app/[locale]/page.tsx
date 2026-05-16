'use client'
import { useFormatter, useTranslations } from 'next-intl'

enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE"
}

interface Use {
  name: string,
  email: string,
  phone: number,
  password: string,
  gender: Gender,
}

export default function Home() {
  const t = useTranslations()
  return (
    <div style={{}}>
      {t('Home.title')}&nbsp;
      {/* {t('ordered', { orderDate: new Date() })} */}
    </div>
  )
}
