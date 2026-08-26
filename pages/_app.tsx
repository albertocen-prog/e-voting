import type { AppProps } from 'next/app'
import '@/styles/globals.css' // ensure this file exists in styles/

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
