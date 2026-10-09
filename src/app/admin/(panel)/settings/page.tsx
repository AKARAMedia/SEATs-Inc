import Link from "next/link";
import { CompanyForm, ContactSettingsForm, MaintenanceForm, SeoForm, SocialForm } from "@/components/admin/SettingsForms";
import { adminSettings, fmtDateTime } from "@/lib/admin-data";
import { emailConfigured } from "@/lib/email";
import type { SettingsGroup } from "@/lib/settings-schema";

export const metadata = { title: "Settings" };

const TABS: { key: SettingsGroup; label: string; description: string }[] = [
  { key: "company", label: "Company", description: "Phone, email, address and map" },
  { key: "social", label: "Social links", description: "Icons in the website header" },
  { key: "seo", label: "SEO", description: "Google and link-sharing previews" },
  { key: "contact", label: "Contact form", description: "Email notifications and auto-reply" },
  { key: "maintenance", label: "Maintenance", description: "Temporarily hide the website" },
];

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const { values, updatedAt } = await adminSettings();
  const saved = updatedAt[tab.key];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Settings</h1>
        <p className="text-[13px] text-[#888]">Changes go live on the website as soon as you save.</p>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-black/10 px-4 lg:mx-0 lg:px-0" aria-label="Settings sections">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings/?tab=${t.key}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[14px] font-semibold ${
              t.key === tab.key ? "border-primary text-primary" : "border-transparent text-[#666] hover:text-[#222]"
            }`}
          >
            {t.label}
            {t.key === "maintenance" && values.maintenance.enabled && <span className="admin-badge bg-red-600 !px-1.5 text-[10px] text-white">ON</span>}
          </Link>
        ))}
      </nav>

      <p className="text-[13px] text-[#888]">
        {tab.description}
        {saved ? ` · Last saved ${fmtDateTime(saved)}` : " · Using the original website values"}
      </p>

      {tab.key === "company" && <CompanyForm key={String(saved)} value={values.company} />}
      {tab.key === "social" && <SocialForm key={String(saved)} value={values.social} />}
      {tab.key === "seo" && <SeoForm key={String(saved)} value={values.seo} />}
      {tab.key === "contact" && <ContactSettingsForm key={String(saved)} value={values.contact} emailReady={emailConfigured()} />}
      {tab.key === "maintenance" && <MaintenanceForm key={String(saved)} value={values.maintenance} />}
    </div>
  );
}
