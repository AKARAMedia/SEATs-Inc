/**
 * Elementor "page title" band used on CEO Message / division pages: a tall white section
 * (pulled up under the sticky header like the live -100px margin) with a centered blue
 * heading and a short blue divider.
 */
export default function CenteredPageTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`-mt-[60px] flex h-[400px] flex-col items-center justify-center pb-[14px] tablet:h-[500px] ${className}`}>
      <h1 className="text-center text-[29px] font-bold capitalize leading-none text-[#0080cc]">{children}</h1>
      <span aria-hidden className="mt-[35px] block h-[2px] w-[40px] bg-[#0080cc] tablet:w-[119px]" />
    </div>
  );
}
