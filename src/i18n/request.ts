import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import fs from 'fs'
import path from 'path'

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const messagesDir = path.join(process.cwd(), 'src/messages', locale)
  const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'))

  const messages: Record<string, unknown> = {}
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf-8'))
    Object.assign(messages, content)
  }

  return {
    locale,
    messages,
  }
})
