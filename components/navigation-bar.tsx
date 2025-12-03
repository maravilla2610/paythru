"use client";
import React, { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Home", link: "#" },
  { name: "Features", link: "#features" },
  { name: "About", link: "#about" },
  { name: "Products", link: "#products" },
];

export const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <NavbarButton href="/login" variant="dark">
          Get Started Now
        </NavbarButton>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="text-lg font-medium text-gray-300 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <NavbarButton href="https://register.boostotc.com" variant="gradient" className="w-full">
            Get Started Now
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
