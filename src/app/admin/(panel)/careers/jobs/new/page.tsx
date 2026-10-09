import Link from "next/link";
import JobForm from "@/components/admin/careers/JobForm";
import { JOB_TYPES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "New job" };

export default async function NewJobPage() {
  await requireAdmin("careers");
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/careers/" className="text-[13px] text-[#888] hover:text-primary">
          ← Careers
        </Link>
        <h1 className="text-[22px] font-semibold">New job</h1>
      </div>
      <JobForm
        types={JOB_TYPES}
        values={{ titleEn: "", titleJa: "", department: "", location: "Phnom Penh", type: "Full-time", descriptionEn: "", descriptionJa: "", slug: "", closesAt: "", open: true }}
      />
    </div>
  );
}
