'use client'

import siteMetadata from '@/data/siteMetadata'
import { homeNavLinks, blogNavLinks } from '@/data/headerNavLinks'
import Link from './link'
import MobileNav from './mobile-nav'
import ThemeSwitch from './theme-switch'
import { usePathname } from 'next/navigation'
import { KBarSearchProvider, KBarSearchProps } from './kbar/kbar'
import KBarButton from './kbar/kbar-button'

const NavLinks = ({ links }) => {
  return (
    <>
      {links.map((link) => (
        <Link key={link.title} href={link.href} className="hidden font-medium sm:block">
          {link.title}
        </Link>
      ))}
    </>
  )
}

const Header = () => {
  const pathname = usePathname()
  const isBlogPage = pathname.includes('/blog')

  return (
    <header className="flex items-center justify-between py-10">
      <div>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center justify-between">
            <div className="mr-3">
              <svg
                viewBox="0 0 116.56 92.428"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
              >
                <g transform="translate(-90.221 -58.786)">
                  <g transform="translate(-9.2428 15.753)">
                    <path
                      className="fill-accent"
                      d="m174.34 134.67c-0.38893-0.48057-7.4906-14.608-7.4906-14.902 0-0.0989 3.8093-0.17975 8.4651-0.17975h8.4651l3.7058 7.4051c2.0382 4.0728 3.7058 7.5653 3.7058 7.7611 0 0.56056-16.396 0.47786-16.851-0.085z"
                    />
                    <g className="fill-secondary">
                      <path d="m99.464 134.76c0-0.46373 45.63-91.723 45.862-91.723 0.0981 0 4.7417 9.1281 10.319 20.285l10.141 20.285h-17.29l-1.4872-2.9986c-0.81794-1.6492-1.5708-2.9956-1.6731-2.992-0.10228 0.0037-6.6769 12.942-14.61 28.751l-14.424 28.745h-8.418c-5.3711 0-8.418-0.12755-8.418-0.35241z" />
                      <path d="m143.29 114.56 0.091-20.902 9.3486-0.08684c5.1417-0.04776 15.143-0.12714 22.225-0.17639l12.876-0.08955 2.035-1.0311c10.178-5.157 10.02-19.35-0.27107-24.391l-2.1167-1.0367-18.697-0.22963-4.2333-7.772c-2.3283-4.2746-4.2916-7.9298-4.3628-8.1227-0.27368-0.74169 29.008-0.10752 32.409 0.7019 30.893 7.353 31.356 49.239 0.63285 57.291-2.7452 0.71948-3.8902 0.77528-18.536 0.90336l-15.61 0.13652v25.707h-15.881z" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <NavLinks links={isBlogPage ? blogNavLinks : homeNavLinks} />
        {isBlogPage && siteMetadata.search?.provider === 'kbar' && (
          <KBarSearchProvider kbarConfig={siteMetadata.search.kbarConfig as KBarSearchProps}>
            <KBarButton />
          </KBarSearchProvider>
        )}
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
