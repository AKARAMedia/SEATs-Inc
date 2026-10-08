import { Montserrat } from "next/font/google";

// Elementor "Montserrat" headings used on the division / recruit pages.
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});
