"use client";

import { useTransition } from "react";
import { setCareerJobOpenAction } from "@/app/admin/career-job-actions";
import { toast } from "./ui/toast";

export default function CareerJobOpenToggle({ id, open }: { id: number; open: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setCareerJobOpenAction(id, !open).then(() => toast(open ? "Job closed — hidden from seatsinc-career.com." : "Job opened — shown on seatsinc-career.com.")))}
      className="admin-btn-secondary !py-1 text-[13px]"
    >
      {open ? "Close" : "Reopen"}
    </button>
  );
}
