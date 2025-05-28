"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { removeServices, type Service } from "@/lib/serviceStorage";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  services: Service[];
  onServicesChange: () => void;
}

export default function ServiceGrid({ services, onServicesChange }: ServiceGridProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const handleServiceSelection = (serviceId: string, selected: boolean) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(serviceId);
        setSelectionMode(true);
      } else {
        newSet.delete(serviceId);
        if (newSet.size === 0) {
          setSelectionMode(false);
        }
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    removeServices(Array.from(selectedServices));
    
    setSelectedServices(new Set());
    setSelectionMode(false);
    onServicesChange();
    
    window.dispatchEvent(new Event('servicesUpdated'));
  };

  const handleCancelSelection = () => {
    setSelectedServices(new Set());
    setSelectionMode(false);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <div className="text-4xl">📦</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No services yet</h3>
            <p className="text-muted-foreground">
              Your services will appear here once you add them. Start by adding your first service above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">      {selectionMode && (
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-lg p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">
                  {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready for deletion
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline" 
                size="sm" 
                onClick={handleCancelSelection}
                className="touch-manipulation"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                disabled={selectedServices.size === 0}
                className="touch-manipulation"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedServices.size > 1 ? 'Services' : 'Service'}
              </Button>
            </div>
          </div>
          {selectedServices.size === 0 && (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Long-press or right-click on service cards to select them for deletion
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.has(service.id)}
            onSelectionChange={(selected) => handleServiceSelection(service.id, selected)}
            selectionMode={selectionMode}
          />
        ))}
      </div>
    </div>
  );
}
