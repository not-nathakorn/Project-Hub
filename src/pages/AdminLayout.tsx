"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconSettings,
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
        "flex flex-col md:flex-row w-full flex-1 mx-auto overflow-hidden",
        "h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-neutral-950 dark:via-blue-950/20 dark:to-neutral-950"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 glass border-r border-white/20 dark:border-white/10">
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
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    AD
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-hidden">
        <div className="p-4 md:p-8 flex flex-col gap-6 flex-1 w-full h-full overflow-y-auto">
          {/* Header Card with Glass Effect */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black gradient-text mb-2">
                  {activeTab === 'dashboard' && 'Web Analytics'}
                  {activeTab === 'content' && 'Content Management'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, Admin • {new Date().toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-muted-foreground">System Online</span>
              </div>
            </div>
          </motion.div>
          
          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            {activeTab === 'dashboard' && <AnalyticsDashboard />}
            {activeTab === 'content' && <ContentManager />}
            {activeTab === 'settings' && (
              <div className="glass rounded-2xl border border-white/20 dark:border-white/10 shadow-xl p-12 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold gradient-text mb-2">Settings</p>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20"
    >
      <img 
        src="/Logo.png" 
        alt="CodeX Logo" 
        className="h-8 w-8 object-contain rounded-lg"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent whitespace-pre"
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
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <img 
        src="/Logo.png" 
        alt="CodeX Logo" 
        className="h-8 w-8 object-contain rounded-lg"
      />
    </a>
  );
};
