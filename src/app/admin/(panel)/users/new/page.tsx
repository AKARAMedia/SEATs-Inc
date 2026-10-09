import Link from "next/link";
import UserForm from "@/components/admin/UserForm";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Add user" };

export default async function NewUserPage() {
  await requireAdmin("users");
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/users/" className="text-[13px] text-[#888] hover:text-primary">
          ← All users
        </Link>
        <h1 className="text-[22px] font-semibold">Add user</h1>
      </div>
      <UserForm values={{ name: "", email: "", role: "editor", active: true }} />
    </div>
  );
}
