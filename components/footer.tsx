"use client";

import Link from "next/link";
import { FaTwitter, FaLinkedin, FaTelegram, FaDiscord } from "react-icons/fa";
import Image from "next/image";
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image src="/boost-logo.png" alt="Boost OTC Logo" width={100} height={33} />
            <p className="text-gray-400 text-sm">
              Institutional-grade crypto OTC trading desk. Execute large-volume trades with deep liquidity and white-glove service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Our Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Spot Trading</li>
              <li className="text-gray-400 text-sm">Block Trades</li>
              <li className="text-gray-400 text-sm">Custody Solutions</li>
              <li className="text-gray-400 text-sm">Structured Products</li>
              <li className="text-gray-400 text-sm">Portfolio Financing</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Bitrus OTC. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/compliance" className="text-gray-400 hover:text-white transition-colors text-sm">
                Compliance
              </Link>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center md:text-left">
            Disclaimer: Cryptocurrency trading carries significant risk. Past performance is not indicative of future results. Only invest what you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
};
