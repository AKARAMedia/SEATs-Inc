import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { unreadMessageCount } from "@/lib/admin-data";
import { newApplicationCount } from "@/lib/careers";
import { can } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
import { logoutAction } from "../actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { FlashToast, Toaster } from "@/components/admin/ui/toast";
import { ConfirmHost } from "@/components/admin/ui/confirm";

async function Sidebar() {
  const { name, email, role } = await requireAdmin();
  const [unread, applications, careerApplications] = await Promise.all([
    can(role, "messages") ? unreadMessageCount() : 0,
    can(role, "careers") ? newApplicationCount("main") : 0,
    can(role, "careers") ? newApplicationCount("career") : 0,
  ]);
  return (
    <AdminSidebar
      user={{ name, email, role }}
      unread={unread}
      applications={applications}
      careerApplications={careerApplications}
      logout={logoutAction}
    />
  );
}

async function MaintenanceBanner() {
  const { maintenance } = await getSettings();
  if (!maintenance.enabled) return null;
  return (
    <div className="bg-red-600 px-4 py-2 text-center text-[13px] font-semibold text-white">
      Maintenance mode is ON — visitors can&apos;t see the website.{" "}
      <Link href="/admin/settings/?tab=maintenance" className="text-white underline">
        Turn off
      </Link>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen lg:pl-[240px]">
      <Suspense fallback={<div className="h-14 border-b border-black/10 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[240px] lg:border-r lg:border-b-0" />}>
        <Sidebar />
      </Suspense>
      <Suspense>
        <MaintenanceBanner />
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
