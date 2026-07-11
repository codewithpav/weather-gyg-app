import type { AppProps } from "next/app";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "../styles/globals.css";

// Body / UI type — warmer and more characterful than the ubiquitous Inter.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Display type — used for headings, the wordmark, and large weather numbers.
const display = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${sans.variable} ${display.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
