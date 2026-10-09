import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { FlashToast, Toaster } from "@/components/admin/ui/toast";
import { ConfirmHost } from "@/components/admin/ui/confirm";

async function Sidebar() {
  const { name, email, role } = await requireAdmin();
  return <AdminSidebar user={{ name, email, role }} logout={logoutAction} />;
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen lg:pl-[240px]">
      <Suspense fallback={<div className="h-14 border-b border-black/10 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[240px] lg:border-r lg:border-b-0" />}>
        <Sidebar />
      </Suspense>
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <Suspense fallback={<p className="text-[#888]">Loading…</p>}>{children}</Suspense>
      </main>
      <Toaster />
      <ConfirmHost />
      <Suspense>
        <FlashToast />
      </Suspense>
    </div>
  );
}
