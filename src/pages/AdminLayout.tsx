"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconLayoutDashboard,
  IconDatabaseEdit,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { ContentManager } from "@/components/admin/ContentManager";

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'settings'>('dashboard');
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab('dashboard'),
    },
    {
      label: "Manage Content",
      href: "#",
      icon: (
        <IconDatabaseEdit className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab('content'),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab('settings'),
    },
    {
      label: "Logout",
      href: "/",
      icon: (
        <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx} onClick={link.onClick}>
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Admin User",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold">
                    AD
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {activeTab === 'dashboard' && 'Web Analytics'}
              {activeTab === 'content' && 'Content Management'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="text-sm text-neutral-500">
              Welcome back, Admin
            </div>
          </div>
          
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'settings' && (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Settings page coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        CodeX Admin
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </a>
  );
};
