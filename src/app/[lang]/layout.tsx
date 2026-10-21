import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Open_Sans, Roboto, Roboto_Slab } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import PageTracker from "@/components/PageTracker";
import { isLang, LANGS } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import "../globals.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-roboto", display: "swap" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weight: ["400"], variable: "--font-roboto-slab", display: "swap" });

// Every page reads live content from the database, so nothing is prerendered at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const { seo, maintenance } = await getSettings();
  const description = isLang(lang) ? seo.description[lang] : seo.description.en;
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "https://seats-inc.com"),
    title: { default: seo.siteTitle, template: `%s - ${seo.siteTitle}` },
    description,
    openGraph: { siteName: seo.siteTitle, description, ...(seo.shareImage && { images: [seo.shareImage] }) },
    ...(maintenance.enabled && { robots: { index: false, follow: false } }),
  };
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { company, social, maintenance } = await getSettings();
  return (
    <html lang={lang} className={`${openSans.variable} ${roboto.variable} ${robotoSlab.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header lang={lang} socials={social.links} mapUrl={company.mapUrl} />
        <main className="flex-1">
          {maintenance.enabled ? (
            // Maintenance mode (Settings → Maintenance): every public page shows this notice instead
            <div className="container-site flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
              <h1 className="mb-4 text-[24px] font-bold text-primary">{lang === "ja" ? "メンテナンス中" : "Under maintenance"}</h1>
              <p className="max-w-[560px] whitespace-pre-line text-[17px]">{maintenance.message[lang]}</p>
            </div>
          ) : (
            children
          )}
        </main>
        <Footer lang={lang} company={company} />
        <CookieBanner lang={lang} />
        <PageTracker />
      </body>
    </html>
  );
}
