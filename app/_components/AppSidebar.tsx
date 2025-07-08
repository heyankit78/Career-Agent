import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { AtomIcon, HistoryIcon, User2Icon, Wallet2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
const items = [
  {
    title: "AI Tools",
    url: "/dashboard",
    icon: AtomIcon,
  },
  {
    title: "My History",
    url: "/history",
    icon: HistoryIcon,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: Wallet2,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User2Icon,
  },
];

export function AppSidebar() {
  const path = usePathname();
  // state: "expanded" | "collapsed"
  const { state } = useSidebar();
  // Improved active path matching
  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return path === url; // Exact match for dashboard
    }
    return path.startsWith(url); // Starts with match for other routes
  };
  const childVariant = {
    open: {
      opacity: 1,
      y: 0,
    },
    closed: {
      opacity: 0,
      y: -40,
    },
  };
  const sidebarVariant = {
    open: {
      opacity: 1,
      x: 0,
    },
    closed: {
      opacity: 0,
      x: -40,
    },
  };
  const parentVariant = {
    open: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.3,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: -1,
      },
    },
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-sm text-gray-400 text-center mt-3">
            Build Awesome Skills
          </h2>
        </div>
      </SidebarHeader>
      <motion.div
        initial={false}
        variants={sidebarVariant}
        exit="closed"
        animate={state == "expanded" ? "open" : "closed"}
        transition={{ duration: 0.4 }}
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="mt-5">
                <motion.div variants={parentVariant}>
                  {items.map((item, index) => (
                    <motion.a
                      variants={childVariant}
                      href={item.url}
                      key={index}
                      className={`p-2 text-lg flex gap-2 items-center hover:bg-gray-100 rounded-lg ${
                        isActive(item.url) ? "bg-gray-200 font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5" />

                      {state === "expanded" && <span>{item.title}</span>}
                    </motion.a>
                  ))}
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </motion.div>
      <SidebarFooter>
        <h2 className="p-2 text-gray-400 text-sm">Copyright @heyankit</h2>
      </SidebarFooter>
    </Sidebar>
  );
}
