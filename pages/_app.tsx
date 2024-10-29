import type { AppProps } from "next/app";

import "../styles/variables.css";
import "../styles/globals.css";
import "../styles/decorations.css";
import "../styles/autocomplete.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
