"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import SecurityConfig from "@/components/SecurityConfig";
import SecurityStatus from "@/components/SecurityStatus";
import ServiceManager from "@/components/ServiceManager";
import EnhancedServiceForm from "@/components/EnhancedServiceForm";

export default function ConfigPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <main className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-lg text-muted-foreground">
            Manage your HubUI settings and services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Choose your preferred appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <SecurityConfig />

        <SecurityStatus />

        <ServiceManager />

        <EnhancedServiceForm />
      </main>
    </div>
  );
}
