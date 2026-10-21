import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../globals.css";
import "./admin.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

// Admin pages always show live data.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · S.E.A.T.S Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="min-h-screen bg-[#f4f6f9] text-[14px] text-[#333] antialiased">{children}</body>
    </html>
  );
}
