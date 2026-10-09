"use client";

import { useState } from "react";
import { toast } from "./ui/toast";

function generate() {
  // No look-alike characters (0/O, 1/l/I) so it can be read out or typed from a screen
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/** Password field with show/hide and an optional "Generate" button that copies the result. */
export default function PasswordInput({
  name,
  generator,
  invalid,
  ...rest
}: { name: string; generator?: boolean; invalid?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          {...rest}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={invalid}
          className="admin-input pr-16 font-mono placeholder:font-sans"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 px-3 text-[12px] font-semibold text-[#777] hover:text-primary"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {generator && (
        <button
          type="button"
          className="admin-btn-secondary shrink-0 text-[13px]"
          onClick={async () => {
            const pw = generate();
            setValue(pw);
            setShow(true);
            try {
              await navigator.clipboard.writeText(pw);
              toast("Password generated and copied to clipboard.", "info");
            } catch {
              toast("Password generated — copy it before saving.", "info");
            }
          }}
        >
          Generate
        </button>
      )}
    </div>
  );
}
