// Recruit ("Option Career") page copy. The live /ja/ version is untranslated (same English copy).
export const CAREER = {
  title: { en: "Option Career", ja: "Option Career" },
  heading: { join: "Join", our: "Our", team: "Team" },
  text: {
    en: "Seeking an opportunity to earn, learn and push yourself to new limits? Discover more about the recruitment process with S.E.A.T.S Inc., for both Cambodian and Japanese by clicking the button below.",
    ja: "Seeking an opportunity to earn, learn and push yourself to new limits? Discover more about the recruitment process with S.E.A.T.S Inc., for both Cambodian and Japanese by clicking the button below.",
  },
  buttons: [
    { label: "CAMBODIAN", href: "https://seatsinc-career.com" },
    // /jp/ is the separate static Japanese recruiting site hosted alongside WordPress.
    // (Live mobile links to seatsinc-career.com/jp/, which 404s — not copied.)
    { label: "JAPANESE", href: "/jp/" },
  ],
  images: {
    hero: { src: "/media/2025/01/career.png", width: 1673, height: 1830 },
    blobRight: { src: "/media/2025/01/bg-career-2.png", width: 323, height: 244 },
    blobLeft: { src: "/media/2025/01/bg-career-1.png", width: 526, height: 367 },
  },
} as const;
