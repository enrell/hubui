"use client";

import { useState } from "react";
import { addService } from "@/lib/serviceStorage";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AddServiceForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshServices } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      alert("Please fill in both name and URL");
      return;
    }

    // Basic URL validation
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
      
      refreshServices();
      
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
    <Card className="w-full max-w-md">
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
  );
}
