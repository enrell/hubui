"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ArrowRight,
} from "lucide-react";
import AddServiceForm from "@/components/AddServiceForm";
import ServiceGrid from "@/components/ServiceGrid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServices, type Service } from "@/lib/serviceStorage";

export const dynamic = "force-dynamic";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadedServices = getServices();
    setServices(loadedServices);

    const handleStorageChange = () => {
      const updatedServices = getServices();
      setServices(updatedServices);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("servicesUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("servicesUpdated", handleStorageChange);
    };
  }, []);

  const hasServices = services.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to HubUI
            </h1>
          </div>
        </div>

        {/* Main Content Area */}
        {!hasServices ? (
          /* Empty State - First Time User Experience */
          <div className="text-center space-y-8">
            <Card className="max-w-2xl mx-auto border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">
                  Get Started in Seconds
                </CardTitle>
                <CardDescription className="text-lg">
                  Add your first service to begin organizing your digital
                  workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    size="lg"
                    className="group h-12 px-8 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Add Your First Service
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <AddServiceForm />
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Quick Start Guide */}
                <div className="bg-muted/30 rounded-lg p-6 text-left mt-8">
                  <h3 className="font-semibold mb-4 text-center">
                    How it works
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Add a service</p>
                        <p className="text-sm text-muted-foreground">
                          Enter a name and URL for any web service you use
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Access from anywhere</p>
                        <p className="text-sm text-muted-foreground">
                          Click the service card or use the navbar to open it
                          instantly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Stay organized</p>
                        <p className="text-sm text-muted-foreground">
                          Manage all your services from one clean, secure
                          interface
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Existing Services View */
          <div className="space-y-8">
            {/* Services Header with Add Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Your Services
                </h2>
                <p className="text-muted-foreground mt-1">
                  Manage and access your {services.length} configured service
                  {services.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="group"
                variant={showAddForm ? "secondary" : "default"}
              >
                <Plus
                  className={`w-4 h-4 mr-2 transition-transform ${
                    showAddForm ? "rotate-45" : "group-hover:rotate-90"
                  }`}
                />
                {showAddForm ? "Cancel" : "Add Service"}
              </Button>
            </div>

            {/* Add Service Form */}
            {showAddForm && (
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Add New Service</CardTitle>
                  <CardDescription>
                    Add any web service with a URL to access it through HubUI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddServiceForm />
                </CardContent>
              </Card>
            )}

            {/* Services Grid */}
            <ServiceGrid 
              services={services} 
              onServicesChange={() => setServices(getServices())} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
