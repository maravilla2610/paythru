"use client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { EncryptedText } from "../ui/encrypted-text";

export const Hero = () => {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-between bg-black px-4 pt-32">
      <div className="flex max-w-5xl flex-col items-center justify-center space-y-8 text-center">
        <h1 className="bg-gradient-to-b from-gray-400 to-white bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
          Institutional-Grade
          <br />
          <EncryptedText text="Crypto OTC Trading" />
        </h1>
        <p className="max-w-3xl text-base text-gray-400 sm:text-lg md:text-xl">
          Execute large-volume crypto trades with deep liquidity, competitive pricing, and white-glove service. Trusted by institutions, funds, and high-net-worth individuals worldwide.
        </p>
        <HoverBorderGradient
          containerClassName="rounded-full"
          className="text-white font-bold text-md px-10 py-5 "
          as="button"
        >
          Request a Quote
        </HoverBorderGradient>
      </div>
    </section>
  );
};
