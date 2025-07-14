import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageTransitionWrapper } from '../components/shared/PageTransition'

function MyApp({ Component, pageProps }: AppProps) {
  // Detect server-side rendering
  const isServer = typeof window === 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // During SSR, render the component directly without any hooks or context
  // This prevents React context errors during prerendering
  if (isServer) {
    return <Component {...pageProps} />;
  }
  
  // From this point on, we're on the client side only
  const router = useRouter();
  
  // Client-side route change handling
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      console.log(`App is navigating to: ${url}`)
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  // Client-side styling
  useEffect(() => {
    // Add dark mode class to document element
    document.documentElement.classList.add('dark')
    document.body.classList.add('bg-[#242424]')
    
    // Prevent white flash by setting background color directly
    document.documentElement.style.backgroundColor = '#242424'
    document.body.style.backgroundColor = '#242424'
  }, [])

  // Special handling for error pages to avoid React context issues
  const isErrorPage = router.pathname === '/500' || 
                      router.pathname === '/404' || 
                      router.pathname === '/_error';
  
  // For error pages or in production, render without animations
  if (isProduction || isErrorPage) {
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
