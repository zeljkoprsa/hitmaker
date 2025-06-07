import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageTransitionWrapper } from '../components/shared/PageTransition'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

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
    document.body.classList.add('bg-useless-dark')
    
    // Prevent white flash by setting background color directly
    document.documentElement.style.backgroundColor = '#242424'
    document.body.style.backgroundColor = '#242424'
  }, [])

  return (
    <PageTransitionWrapper type="fade" duration={0.3}>
      <Component {...pageProps} />
    </PageTransitionWrapper>
  )
}

export default MyApp
