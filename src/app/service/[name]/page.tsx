"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getServices, type Service } from "@/lib/serviceStorage";
import ServiceFrame from "@/components/ServiceFrame";

export default function ServicePage() {
  const params = useParams();
  const serviceName = decodeURIComponent(params.name as string);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const services = getServices();
    const foundService = services.find(s => s.name === serviceName);
    setService(foundService || null);
    setLoading(false);
  }, [serviceName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold text-destructive">Service Not Found</h1>
        <p className="text-muted-foreground">The service &quot;{serviceName}&quot; could not be found.</p>
      </div>
    );
  }

  return <ServiceFrame service={service} isActive={true} />;
}
