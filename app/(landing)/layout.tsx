import { NavigationBar } from "@/components/navigation-bar";
import { Footer } from "@/components/footer";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      {children}
      <Footer />
    </>
  );
}
