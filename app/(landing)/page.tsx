import { Hero } from "@/components/landing/hero";
import { BentoGridLanding } from "@/components/landing/features";
import { About } from "@/components/landing/about";
import { Products } from "@/components/landing/products";
export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <BentoGridLanding />
      <About />
      <Products />
    </div>
  );
}
