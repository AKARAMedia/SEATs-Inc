"use client";

/** A <select> that submits its parent GET form as soon as the value changes. */
export default function AutoSubmitSelect({ name, defaultValue, options }: { name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <select name={name} defaultValue={defaultValue} className="admin-input !w-auto" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
