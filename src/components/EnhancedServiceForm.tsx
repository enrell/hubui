"use client";

import { useState } from "react";
import { addService } from "@/lib/serviceStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Settings, AlertTriangle, Zap } from "lucide-react";

const SANDBOX_PRESETS = [
  {
    name: 'Secure',
    description: 'Basic functionality with strong security isolation',
    icon: <Shield className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms'],
    level: 'secure',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    name: 'Normal',
    description: 'Balanced security and functionality for most web applications',
    icon: <Settings className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms', 'allow-popups', 'allow-modals'],
    level: 'normal',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    name: 'Unsafe',
    description: 'Reduced security for applications requiring extended permissions',
    icon: <AlertTriangle className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms', 'allow-popups', 'allow-same-origin', 'allow-modals', 'allow-downloads'],
    level: 'unsafe',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    name: 'Full Compatibility',
    description: 'All permissions enabled - recommended for Jellyfin and similar services',
    icon: <Zap className="h-4 w-4" />,
    policies: [
      'allow-scripts', 'allow-forms', 'allow-popups', 'allow-same-origin', 
      'allow-modals', 'allow-downloads', 'allow-orientation-lock', 
      'allow-pointer-lock', 'allow-presentation', 'allow-storage-access-by-user-activation'
    ],
    level: 'full',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

export default function EnhancedServiceForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      alert("Please fill in both name and URL");
      return;
    }

    const { validateServiceUrl, isLocalDevelopmentUrl } = await import("@/lib/urlValidation");
    const { getSecuritySettings } = await import("@/components/SecurityConfig");
    
    const securitySettings = getSecuritySettings();
    
    const validation = validateServiceUrl(url.trim(), {
      allowHttp: securitySettings.allowHttp,
      allowPrivateNetworks: securitySettings.allowPrivateNetworks,
      requireHttps: securitySettings.requireHttps
    });

    if (!validation.isValid) {
      alert(`Invalid URL: ${validation.reason}`);
      return;
    }

    const isLocal = isLocalDevelopmentUrl(url.trim());
    if (!isLocal) {
      const proceed = confirm(
        "Warning: You are adding an external service. This may expose your local network to security risks. " +
        "Only add services you trust. Do you want to continue?"
      );
      if (!proceed) {
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const preset = SANDBOX_PRESETS.find(p => p.level === selectedPreset);
      const sandboxPolicies = preset ? preset.policies : ['allow-scripts', 'allow-forms'];
      
      addService({ 
        name: name.trim(), 
        url: validation.sanitizedUrl || url.trim(),
        sandboxPolicies
      });
      
      window.dispatchEvent(new Event('servicesUpdated'));
      
      setName("");
      setUrl("");
      setSelectedPreset("normal");
      
      alert(`Service "${name}" added successfully with ${preset?.name || 'Normal'} security preset!`);
    } catch (error) {
      alert("Failed to add service. Please try again.");
      console.error(error);
    }
    
    setIsSubmitting(false);
  };

  const selectedPresetData = SANDBOX_PRESETS.find(p => p.level === selectedPreset);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Service
        </CardTitle>
        <CardDescription>
          Add a service to your HubUI dashboard with customizable security policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="space-y-3">
            <Label htmlFor="security-preset">Security Preset</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Select security preset" />
              </SelectTrigger>
              <SelectContent>
                {SANDBOX_PRESETS.map((preset) => (
                  <SelectItem key={preset.level} value={preset.level}>
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <span>{preset.name}</span>
                      <Badge className={preset.color} variant="secondary">
                        {preset.level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPresetData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {selectedPresetData.icon}
                  <span className="font-medium">{selectedPresetData.name}</span>
                  <Badge className={selectedPresetData.color} variant="secondary">
                    {selectedPresetData.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedPresetData.description}
                </p>
                <div className="text-xs">
                  <span className="font-medium">Enabled policies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPresetData.policies.map((policy) => (
                      <Badge key={policy} variant="outline" className="text-xs">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedPreset === 'unsafe' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Security Warning</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  This preset reduces security isolation. Only use for trusted services.
                </p>
              </div>
            )}

            {selectedPreset === 'full' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Full Compatibility Mode</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Recommended for Jellyfin, Plex, and other media servers that require extensive permissions.
                  You can always adjust these settings later in Service Management.
                </p>
              </div>
            )}
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
