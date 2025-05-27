"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getServices, type Service } from "@/lib/serviceStorage";

interface ServiceState {
  [serviceName: string]: {
    loaded: boolean;
    src: string;
  };
}

interface AppContextType {
  services: Service[];
  serviceStates: ServiceState;
  currentView: string;
  setCurrentView: (view: string) => void;
  initializeService: (serviceName: string, url: string) => void;
  refreshServices: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceStates, setServiceStates] = useState<ServiceState>({});
  const [currentView, setCurrentView] = useState("home");

  const refreshServices = () => {
    setServices(getServices());
  };

  const initializeService = (serviceName: string, url: string) => {
    setServiceStates(prev => ({
      ...prev,
      [serviceName]: {
        loaded: true,
        src: url
      }
    }));
  };

  useEffect(() => {
    refreshServices();
    
    const handleStorageChange = () => {
      refreshServices();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('servicesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('servicesUpdated', handleStorageChange);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      services,
      serviceStates,
      currentView,
      setCurrentView,
      initializeService,
      refreshServices
    }}>
      {children}
    </AppContext.Provider>
  );
}
