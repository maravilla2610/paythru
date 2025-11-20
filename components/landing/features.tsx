"use client";
import React from "react";
import dynamic from "next/dynamic";
import { globeConfig, sampleArcs } from "../ui/globe/config";

const World = dynamic(() => import("../ui/globe/globe").then((m) => m.World), {
  ssr: false,
});

export function BentoGridLanding() {
  return (
    <section className="bg-black py-20 px-4" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 bg-gradient-to-b from-gray-400 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Why Trade OTC With Us
          </h2>
          <p className="text-gray-400">
            We provide you the liquidity and ability to send all over the world,
            instantly.
          </p>
        </div>
        <div className="mt-8 flex w-full items-center justify-center">
          <div className="h-[320px] w-[320px] md:h-[420px] md:w-[420px]">
            <World data={sampleArcs} globeConfig={globeConfig} />
          </div>
        </div>
      </div>
    </section>
  );
}
