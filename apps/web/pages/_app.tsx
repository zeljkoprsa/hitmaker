import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageTransitionWrapper } from '../components/shared/PageTransition'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isProduction = process.env.NODE_ENV === 'production';
  const isServer = typeof window === 'undefined';
  
  // Only run effects on the client side
  if (!isServer) {
    // Example of handling route change events - this could be used for analytics
    useEffect(() => {
      const handleRouteChange = (url: string) => {
        // This could be used to trigger analytics events
        console.log(`App is navigating to: ${url}`)
      }

      router.events.on('routeChangeStart', handleRouteChange)
      return () => {
        router.events.off('routeChangeStart', handleRouteChange)
      }
    }, [router])

    // Add a useEffect to set the background color on the document
    useEffect(() => {
      // Add dark mode class to document element
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-[#242424]')
      
      // Prevent white flash by setting background color directly
      document.documentElement.style.backgroundColor = '#242424'
      document.body.style.backgroundColor = '#242424'
    }, [])
  }

  // Special handling for error pages to avoid React context issues
  const isErrorPage = router.pathname === '/500' || router.pathname === '/404' || router.pathname === '/_error';
  
  // In production or on the server, or for error pages, just render the component without animations
  // This helps avoid SSR issues with React context in Framer Motion
  if (isServer || isProduction || isErrorPage) {
    return <Component {...pageProps} />;
  }
  
  // Only use PageTransitionWrapper in development on the client for non-error pages
  return (
    <PageTransitionWrapper type="fade" duration={0.3}>
      <Component {...pageProps} />
    </PageTransitionWrapper>
  )
}

export default MyApp
