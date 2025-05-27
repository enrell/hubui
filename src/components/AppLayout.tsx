"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import Navbar from "./Navbar";
import ServiceFrame from "./ServiceFrame";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentView, setCurrentView, services } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      setCurrentView("home");
    } else if (pathname === "/config") {
      setCurrentView("config");
    } else if (pathname.startsWith("/service/")) {
      const serviceName = decodeURIComponent(pathname.split("/service/")[1]);
      setCurrentView(serviceName);
    }
  }, [pathname, setCurrentView]);

  return (
    <>
      <Navbar />
      <div className="relative">
        <div className={currentView === "home" || currentView === "config" ? "block" : "hidden"}>
          {children}
        </div>
        
        {services.map((service) => (
          <div
            key={service.id}
            className={currentView === service.name ? "block" : "hidden"}
          >
            <ServiceFrame
              service={service}
              isActive={currentView === service.name}
            />
          </div>
        ))}
      </div>
    </>
  );
}
