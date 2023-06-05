import React, { PropsWithChildren } from "react";

import "styles/globals.css";

export const metadata = {};

export default async function RootLayout({ children }: PropsWithChildren) {
  const headResponse = await fetch(`${process.env.BASE_URL}/theme/head.json`);
  let head: { tag: string; [key: string]: string }[] = [];
  if (headResponse.ok) {
    const headData = await headResponse.json();
    if (headData && Array.isArray(headData)) {
      head = headData;
    }
  }

  const headElements = head.map((item, index) => {
    const { tag, ...props } = item;
    return React.createElement(tag, {
      ...props,
      key: `head-${index}`,
    });
  });

  return (
    <html lang="en" className="w-full h-full">
      <head>{headElements}</head>
      <body className="w-full h-full overflow-auto">{children}</body>
    </html>
  );
}
