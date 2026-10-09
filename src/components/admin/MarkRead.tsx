"use client";

import { useEffect, useRef } from "react";
import { markReadAction } from "@/app/admin/message-actions";

/** Marks a message read once it has been opened (also refreshes the unread badge). */
export default function MarkRead({ id }: { id: number }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void markReadAction(id);
  }, [id]);
  return null;
}
