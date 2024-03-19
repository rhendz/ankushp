import Script from 'next/script.js'

export interface GoogleAnalyticsProps {
  googleAnalyticsId: string
}

const Analytics = ({ googleAnalyticsId }: GoogleAnalyticsProps) => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />

      <Script strategy="afterInteractive" id="ga-script">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}', {cookie_flags: 'SameSite=None;Secure'});
        `}
      </Script>
    </>
  )
}

export default Analytics
