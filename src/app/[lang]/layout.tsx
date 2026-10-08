import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Open_Sans, Roboto, Roboto_Slab } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { isLang, LANGS } from "@/lib/i18n";
import "../globals.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-roboto", display: "swap" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weight: ["400"], variable: "--font-roboto-slab", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://seats-inc.com"),
  title: { default: "S.E.A.T.S Inc. (シーツインク)", template: "%s - S.E.A.T.S Inc. (シーツインク)" },
  description:
    "S.E.A.T.S Inc. is a Japanese-owned enterprise based in Phnom Penh, Cambodia since 2013, combining Japanese expertise with Cambodian potential.",
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} className={`${openSans.variable} ${roboto.variable} ${robotoSlab.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
        <CookieBanner lang={lang} />
      </body>
    </html>
  );
}
