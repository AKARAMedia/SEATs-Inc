import Link from "next/link";
import CareerJobForm from "@/components/admin/CareerJobForm";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "New career job" };

export default async function NewCareerJobPage() {
  await requireAdmin("careers");
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/career-jobs/" className="text-[13px] text-[#888] hover:text-primary">
          ← Career Jobs
        </Link>
        <h1 className="text-[22px] font-semibold">New career job</h1>
      </div>
      <CareerJobForm values={{ title: "", type: "Full-time", department: "", location: "Phnom Penh", salaryRange: "", workDays: "", responsibilitiesHtml: "", slug: "", closesAt: "", open: true }} />
    </div>
  );
}
