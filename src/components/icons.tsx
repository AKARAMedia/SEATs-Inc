// Inline SVG icons (replaces Font Awesome / woodmart-font)
type P = { className?: string };

export function SocialIcon({ name, className = "size-[14px]" }: { name: string } & P) {
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 320 512" className={className} fill="currentColor" aria-hidden>
          <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1H297V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 512 512" className={className} fill="currentColor" aria-hidden>
          <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 576 512" className={className} fill="currentColor" aria-hidden>
          <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6C14.9 167 14.9 256.4 14.9 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6V175.2l142.7 81.2z" />
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M3 3h18v18H3zM8 8v8h2v-6h4v6h2V8z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
          <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
          <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3v178.8A162.6 162.6 0 1 1 185 188.3v89.9a74.6 74.6 0 1 0 52.2 71.2V0h88a121 121 0 0 0 1.9 22.2A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 496 512" className={className} fill="currentColor" aria-hidden>
          <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export function PinIcon({ className = "size-[15px]" }: P) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden>
      <path d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7a24 24 0 0 1-39.4 0zM192 272a80 80 0 1 0 0-160 80 80 0 0 0 0 160z" />
    </svg>
  );
}

export function ChevronDown({ className = "size-[9px]" }: P) {
  return (
    <svg viewBox="0 0 10 6" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

export function ChevronRight({ className = "size-[9px]" }: P) {
  return (
    <svg viewBox="0 0 6 10" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 1l4 4-4 4" />
    </svg>
  );
}

export function CalendarIcon({ className = "size-[12px]" }: P) {
  return (
    <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
      <path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z" />
    </svg>
  );
}

export function SearchIcon({ className = "size-[18px]" }: P) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor" aria-hidden>
      <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
    </svg>
  );
}

export function MenuIcon({ className = "size-[20px]" }: P) {
  return (
    <svg viewBox="0 0 20 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M0 1h20M0 8h20M0 15h20" />
    </svg>
  );
}

export function CloseIcon({ className = "size-[16px]" }: P) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M1 1l14 14M15 1L1 15" />
    </svg>
  );
}

export function ArrowUpRight({ className = "size-[11px]" }: P) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l6-6M4 3h5v5" />
    </svg>
  );
}
