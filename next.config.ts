import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  devIndicators: false,
  sassOptions: {
    additionalData: `$var: red;`,
    implementation: 'sass-embedded',
  },
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: `${process.env.NEXT_PUBLIC_API || 'http://lms.edupiatutor.com.vn/api/'}:slug*`,
      },
    ]
  }
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
