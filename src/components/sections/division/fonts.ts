import { Montserrat } from "next/font/google";

// Elementor "Montserrat" headings used on the division / recruit pages.
// No `weight` list: Montserrat is a variable font on Google Fonts, so every weight shares the same
// .woff2 files. Listing weights makes Turbopack emit duplicate font-file queries and fail with
// "next/font/google queries have exactly one entry".
export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});
