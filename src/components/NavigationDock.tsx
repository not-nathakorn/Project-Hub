import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconHome,
  IconTerminal2,
  IconUser,
  IconMail,
} from "@tabler/icons-react";

import { useLocation } from "react-router-dom";

export function NavigationDock() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "About",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#about",
    },
    {
      title: "Services",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#features",
    },
    {
      title: "Contact",
      icon: (
        <IconMail className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#contact",
    },
    {
      title: "Twitter",
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full pointer-events-none hidden md:flex lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
      <div className="pointer-events-auto">
        <FloatingDock
          items={links}
        />
      </div>
    </div>
  );
}
