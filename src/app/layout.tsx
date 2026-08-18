import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider, themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "සුව நலம் AI — Medical Report & Prescription Cross-Checker",
  description:
    "Upload your medical documents and let AI analyze prescriptions for drug interactions, track lab trends, and answer your health questions. Not a substitute for professional medical advice.",
  keywords: [
    "medical report analyzer",
    "drug interaction checker",
    "prescription cross-checker",
    "lab result trends",
    "AI health assistant",
  ],
  openGraph: {
    title: "සුව நலம் AI — Medical Report & Prescription Cross-Checker",
    description:
      "AI-powered medical document analysis. Upload reports, check drug interactions, track lab trends.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
