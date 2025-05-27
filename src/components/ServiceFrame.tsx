"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import type { Service } from "@/lib/serviceStorage";

interface ServiceFrameProps {
  service: Service;
  isActive: boolean;
}

export default function ServiceFrame({ service, isActive }: ServiceFrameProps) {
  const { serviceStates, initializeService } = useApp();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serviceState = serviceStates[service.name];

  useEffect(() => {
    if (isActive && !serviceState?.loaded) {
      initializeService(service.name, service.url);
    }
  }, [isActive, service.name, service.url, serviceState, initializeService]);

  if (!serviceState?.loaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-lg">Loading {service.name}...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <iframe
        ref={iframeRef}
        src={service.url}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        title={service.name}
        loading="lazy"
      />
    </div>
  );
}
