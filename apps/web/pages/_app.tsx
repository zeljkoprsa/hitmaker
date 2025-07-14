import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageTransitionWrapper } from '../components/shared/PageTransition'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Example of handling route change events - this could be used for analytics
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const handleRouteChange = (url: string) => {
        // This could be used to trigger analytics events
        console.log(`App is navigating to: ${url}`)
      }

      router.events.on('routeChangeStart', handleRouteChange)
      return () => {
        router.events.off('routeChangeStart', handleRouteChange)
      }
    }
  }, [router])

  // Add a useEffect to set the background color on the document
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Add dark mode class to document element
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-[#242424]')
      
      // Prevent white flash by setting background color directly
      document.documentElement.style.backgroundColor = '#242424'
      document.body.style.backgroundColor = '#242424'
    }
  }, [])

  // Check if we're running on the server or in production
  const isServer = typeof window === 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // If we're on the server or in production, just render the component without animations
  // This helps avoid SSR issues with React context in Framer Motion
  if (isServer || isProduction) {
    return <Component {...pageProps} />;
  }
  
  // Only use PageTransitionWrapper in development on the client
  return (
    <PageTransitionWrapper type="fade" duration={0.3}>
      <Component {...pageProps} />
    </PageTransitionWrapper>
  )
}

export default MyApp
