'use client'

import siteMetadata from '@/data/siteMetadata'
import { GoogleAnalytics } from 'nextjs-google-analytics'

const isProduction = process.env.NODE_ENV === 'production'

const Analytics = () => {
  return (
    <>
      {isProduction && siteMetadata.analytics && (
        <>
          {siteMetadata.analytics.googleAnalytics && (
            <GoogleAnalytics
              trackPageViews
              gaMeasurementId={siteMetadata.analytics.googleAnalytics.googleAnalyticsId}
            />
          )}
        </>
      )}
    </>
  )
}

export default Analytics
