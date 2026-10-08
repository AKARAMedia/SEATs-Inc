"use client";

import { deletePostAction } from "@/app/admin/actions";

export default function DeletePostButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn-secondary !text-red-600 hover:!bg-red-50">
        Delete
      </button>
    </form>
  );
}
