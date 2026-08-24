import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Drill",
  description: "Personal interview practice: quizzes and coding challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
