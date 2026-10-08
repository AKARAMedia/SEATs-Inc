/**
 * Blue centered page heading + short divider used on Overview / History / Philosophy
 * (Elementor heading 29px/700 #0080cc, divider 2px, ~10% width, 35px gap).
 */
export default function CompanyTitle({
  children,
  as: Tag = "h1",
  className = "",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Tag className="px-5 text-center text-[29px] font-bold capitalize leading-[29px] text-[#0080cc]">{children}</Tag>
      <span aria-hidden className="mt-[35px] block h-[2px] w-[10vw] max-w-[120px] bg-[#0080cc]" />
    </div>
  );
}
