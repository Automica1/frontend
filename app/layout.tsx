import type { ReactNode } from "react";
import "./(main)/globals.css";
import "./(admin)/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
