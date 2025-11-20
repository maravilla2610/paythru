"use client";
import React from "react";
import { Timeline } from "@/components/ui/timeline";
import {
  Card,
  CardSkeletonContainer,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Icon3dRotate, IconMoneybag, IconShield } from "@tabler/icons-react";

  const data = [
    {
      title: "Flexibility",
      content: (
        <Card>
          <CardTitle><Icon3dRotate className="w-10 h-10 color-primary"/></CardTitle>
          <CardDescription>
            Trade 50+ cryptocurrencies with flexible settlement options. Whether you need spot, forward contracts, or customized structured products, we adapt to your unique trading requirements and timeline.
          </CardDescription>
        </Card>
      ),
    },
    {
      title: "Deep Liquidity",
      content: (
        <Card>
          <CardTitle><IconMoneybag className="w-10 h-10"/></CardTitle>
          <CardDescription>
            Execute trades from $100K to $100M+ with minimal slippage. Our extensive network of liquidity providers ensures you get the best prices for institutional-sized orders, 24/7/365.
          </CardDescription>
        </Card>
      ),
    },
    {
      title: "Bank-Grade Security",
      content: (
        <Card>
          <CardTitle><IconShield className="w-10 h-10"/></CardTitle>
          <CardDescription>
            Your assets are protected by multi-signature cold storage, insurance coverage, and SOC 2 compliance. We partner with top-tier custodians and employ military-grade encryption for all transactions.
          </CardDescription>
        </Card>
      ),
    },
  ];

export function About() {
  return (
    <section className="bg-black py-20 px-4" id="about">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 bg-gradient-to-b from-gray-400 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Built for Institutions & High-Net-Worth Traders
          </h2>
          <p className="text-gray-400">
            The trusted OTC desk for executing large-volume crypto trades with confidence and precision.
          </p>
        </div>
        <div className="w-full py-4">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  );
}
