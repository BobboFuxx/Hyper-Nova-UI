import "../styles/globals.css";
import type { AppProps } from "next/app";
import { NotificationsProvider } from "../context/Notifications";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotificationsProvider>
      <Component {...pageProps} />
    </NotificationsProvider>
  );
}
