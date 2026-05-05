import "./globals.css";

export const metadata = {
  title: "MoneyPlant 🌿",
  description: "Grow your money",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen gradient-bg text-gray-800">
        {children}
      </body>
    </html>
  );
}