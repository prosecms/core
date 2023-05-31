import { PropsWithChildren } from "react";

import "styles/globals.css";

export const metadata = {};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
