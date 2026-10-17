import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CONTACT } from "@/content/pages/contact";
import { href, isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Contact" };

export default async function Page({ params }: PageProps<"/[lang]/contact/thank-you">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <div className="container-site flex flex-col items-center px-[15px] py-24 text-center tablet:px-5">
      <p className="max-w-[500px] text-[19px] font-bold leading-[1.6] text-[#1687bd] tablet:text-[21px]">
        {CONTACT.form.success[lang]}
      </p>
      <Link
        href={href(lang, "/")}
        className="mt-10 inline-flex h-[52px] items-center justify-center rounded-[35px] bg-[#91d6f2] px-10 text-[16px] font-bold uppercase text-[#087cb4] transition hover:bg-[#72c8eb]"
      >
        {lang === "ja" ? "トップページへ戻る" : "Back to home"}
      </Link>
    </div>
  );
}
