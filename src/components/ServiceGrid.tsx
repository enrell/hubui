"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { getServices, removeServices, type Service } from "@/lib/serviceStorage";
import ServiceCard from "./ServiceCard";

export default function ServiceGrid() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

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
    setServices(getServices());
    
    window.dispatchEvent(new Event('servicesUpdated'));
  };

  const handleCancelSelection = () => {
    setSelectedServices(new Set());
    setSelectionMode(false);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">No services added yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first service using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {selectionMode && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 gap-4">
            <span className="text-sm font-medium flex-1">
              {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} selected
            </span>
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
            <div className="text-center p-2">
              <p className="text-sm text-muted-foreground">
                Tap cards to select them for deletion
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
