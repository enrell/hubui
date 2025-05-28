"use client";

import { useState } from "react";
import { addService } from "@/lib/serviceStorage";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Globe, Lock, ExternalLink, Loader2 } from "lucide-react";

export default function AddServiceForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | null;
  }>({ isValid: false, message: "", type: null });
  const { refreshServices } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      setValidationState({
        isValid: false,
        message: "Please fill in both name and URL",
        type: 'error'
      });
      return;
    }

    // Import URL validation dynamically
    const { validateServiceUrl, isLocalDevelopmentUrl } = await import("@/lib/urlValidation");
    const { getSecuritySettings } = await import("@/components/SecurityConfig");
    
    // Get current security settings
    const securitySettings = getSecuritySettings();
    
    // Validate URL with security checks
    const validation = validateServiceUrl(url.trim(), {
      allowHttp: securitySettings.allowHttp,
      allowPrivateNetworks: securitySettings.allowPrivateNetworks,
      requireHttps: securitySettings.requireHttps
    });

    if (!validation.isValid) {
      setValidationState({
        isValid: false,
        message: `Invalid URL: ${validation.reason}`,
        type: 'error'
      });
      return;
    }

    // Warn users about security implications for external URLs
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
      addService({ name: name.trim(), url: validation.sanitizedUrl || url.trim() });
      
      refreshServices();
      
      setName("");
      setUrl("");
      setValidationState({ isValid: false, message: "", type: null });
      
      // Show success message
      setValidationState({
        isValid: true,
        message: `Service "${name}" added successfully!`,
        type: 'success'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setValidationState({ isValid: false, message: "", type: null });
      }, 3000);
      
    } catch (error) {
      setValidationState({
        isValid: false,
        message: "Failed to add service. Please try again.",
        type: 'error'
      });
      console.error(error);
    }
    
    setIsSubmitting(false);
  };

  const getValidationIcon = () => {
    switch (validationState.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Globe className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Service Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Jellyfin, Portainer, Grafana"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground">
            Choose a descriptive name for easy identification
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium">
            Service URL
          </Label>
          <div className="relative">
            <Input
              id="url"
              type="url"
              placeholder="http://localhost:8096 or https://service.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {url && validationState.type && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
          
          {validationState.message && (
            <div className={`flex items-center gap-2 text-xs ${
              validationState.type === 'error' 
                ? 'text-red-600' 
                : validationState.type === 'warning'
                ? 'text-yellow-600'
                : validationState.type === 'success'
                ? 'text-green-600'
                : 'text-blue-600'
            }`}>
              {getValidationIcon()}
              <span>{validationState.message}</span>
            </div>
          )}

          {!validationState.message && (
            <p className="text-xs text-muted-foreground">
              Include the full URL with protocol (http:// or https://)
            </p>
          )}
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          <Lock className="w-3 h-3 mr-1" />
          Secure iframe isolation
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Globe className="w-3 h-3 mr-1" />
          Local storage only
        </Badge>
      </div>

      <Button 
        type="submit" 
        className="w-full md:w-auto md:px-8 h-11"
        disabled={isSubmitting || !name.trim() || !url.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding Service...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Add Service
          </>
        )}
      </Button>

      {/* Quick Examples */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Popular examples:</h4>
        <div className="grid gap-2 text-xs text-muted-foreground">
          <div>• <span className="font-mono">http://localhost:8096</span> - Jellyfin media server</div>
          <div>• <span className="font-mono">http://localhost:9000</span> - Portainer container manager</div>
          <div>• <span className="font-mono">http://localhost:3000</span> - Grafana dashboard</div>
          <div>• <span className="font-mono">https://app.example.com</span> - External service</div>
        </div>
      </div>
    </form>
  );
}
