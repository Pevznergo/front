import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aporto | We Close the Deals You Lost & Reactivate Missed Customers',
  description: 'Stop letting your "Dead Leads" gather dust. Aporto acts as your dedicated Win-Back Sales Team. We use AI Agents to call unconverted contacts and resell your product. Performance-based pricing.',
  keywords: ['churn recovery', 'win-back sales', 'AI sales agents', 'B2B SaaS sales', 'reactivate customers', 'dead leads', 'revenue recovery'],
  openGraph: {
    title: 'Aporto | We Close the Deals You Lost',
    description: 'Reactivate your lost B2B customers with our AI-powered Win-Back Sales Team. Zero integration fees. You only pay when we win them back.',
    url: 'https://aporto.tech',
    siteName: 'Aporto',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aporto | We Close the Deals You Lost',
    description: 'Stop letting your "Dead Leads" gather dust. Aporto acts as your dedicated Win-Back Sales Team.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5M3PTPFD');`,
          }}
        />
      </head>
      <body className="antialiased bg-gray-950 text-gray-100">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5M3PTPFD"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  )
}

