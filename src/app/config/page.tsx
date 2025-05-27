"use client";

import { useState } from "react";
import { addService } from "@/lib/serviceStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ConfigPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      alert("Please fill in both name and URL");
      return;
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        alert("URL must start with http:// or https://");
        return;
      }
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    
    try {
      addService({ name: name.trim(), url: url.trim() });
      
      window.dispatchEvent(new Event('servicesUpdated'));
      
      setName("");
      setUrl("");
      
      alert(`Service "${name}" added successfully!`);
    } catch (error) {
      alert("Failed to add service. Please try again.");
      console.error(error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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

        <Card>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>
              Add a service to your HubUI dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Jellyfin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">Service URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="e.g., http://localhost:8096"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Service"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
