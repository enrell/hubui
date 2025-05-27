"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getServices, type Service } from "@/lib/serviceStorage";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setServices(getServices());
    
    const handleStorageChange = () => {
      setServices(getServices());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('servicesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('servicesUpdated', handleStorageChange);
    };
  }, []);

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        <Link href="/">
          <Button variant="ghost" className="font-semibold">
            Home
          </Button>
        </Link>
        {services.map((service) => (
          <Link key={service.id} href={`/service/${encodeURIComponent(service.name)}`}>
            <Button variant="ghost">
              {service.name}
            </Button>
          </Link>
        ))}
        <Link href="/config" className="ml-auto">
          <Button variant="ghost">
            Config
          </Button>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
