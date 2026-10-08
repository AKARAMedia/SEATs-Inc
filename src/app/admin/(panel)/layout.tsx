import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";
import AdminNav from "@/components/admin/AdminNav";

async function Account() {
  const session = await requireAdmin();
  return (
    <div className="flex items-center gap-3 text-[13px] text-[#666]">
      <span className="max-[640px]:hidden">{session.email}</span>
      <form action={logoutAction}>
        <button type="submit" className="rounded border border-black/10 bg-white px-3 py-1.5 hover:bg-black/5">
          Log out
        </button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
          <Link href="/admin/" className="flex shrink-0 items-center gap-3">
            <Image src="/media/seats-inc.png" alt="S.E.A.T.S Inc." width={1701} height={412} className="h-7 w-auto" />
            <span className="text-[13px] font-semibold text-[#888] max-[640px]:hidden">Admin</span>
          </Link>
          <Suspense>
            <AdminNav />
          </Suspense>
          <div className="ml-auto flex items-center gap-4">
            <a href="/news-event/" target="_blank" className="text-[13px] text-primary hover:underline max-[640px]:hidden">
              View site ↗
            </a>
            <Suspense>
              <Account />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <Suspense fallback={<p className="text-[#888]">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
