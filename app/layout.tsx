import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Upload & Edit Guide",
  description:
    "Upload an image to experiment with edits right in your browser and learn how to share it for review."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
