"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getServiceSandboxPolicies } from "@/lib/serviceStorage";
import { validateServiceUrl } from "@/lib/urlValidation";
import { getSecuritySettings } from "@/components/SecurityConfig";
import type { Service } from "@/lib/serviceStorage";

interface ServiceFrameProps {
  service: Service;
  isActive: boolean;
}

export default function ServiceFrame({ service, isActive }: ServiceFrameProps) {
  const { serviceStates, initializeService } = useApp();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [sandboxPolicies, setSandboxPolicies] = useState<string[]>([]);
  const serviceState = serviceStates[service.name];

  // Validate URL against current security settings
  useEffect(() => {
    const validateSecurity = () => {
      const securitySettings = getSecuritySettings();
      const validation = validateServiceUrl(service.url, {
        allowHttp: securitySettings.allowHttp,
        allowPrivateNetworks: securitySettings.allowPrivateNetworks,
        requireHttps: securitySettings.requireHttps
      });

      if (!validation.isValid) {
        setSecurityError(validation.reason || 'URL not allowed by current security settings');
        return;
      }
      
      setSecurityError(null);
    };

    validateSecurity();

    // Listen for security settings changes
    const handleSecurityUpdate = () => validateSecurity();
    window.addEventListener('securitySettingsUpdated', handleSecurityUpdate);

    return () => {
      window.removeEventListener('securitySettingsUpdated', handleSecurityUpdate);
    };
  }, [service.url]);

  // Get sandbox policies for this service
  useEffect(() => {
    const policies = getServiceSandboxPolicies(service.id);
    setSandboxPolicies(policies);
  }, [service.id]);

  useEffect(() => {
    if (isActive && !serviceState?.loaded && !securityError) {
      initializeService(service.name, service.url);
    }
  }, [isActive, service.name, service.url, serviceState, securityError, initializeService]);

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [serviceState?.src]);

  if (!serviceState?.loaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading {service.name}...</p>
        </div>
      </div>
    );
  }

  if (securityError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center p-8">
          <div className="text-destructive text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-destructive mb-2">Security Policy Violation</h2>
          <p className="text-muted-foreground mb-4">
            This service cannot be loaded due to current security settings:
          </p>
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4 max-w-md mx-auto">
            {securityError}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            To access this service, adjust your security settings in the Configuration page or remove this service.
          </p>
          <div className="flex gap-2 justify-center">
            <a 
              href="/config"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
            >
              Security Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center p-8">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-destructive mb-2">Failed to Load Service</h2>
          <p className="text-muted-foreground mb-4">
            The service &quot;{service.name}&quot; could not be loaded. This might be due to:
          </p>
          <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto mb-4">
            <li>• The service is blocking iframe embedding</li>
            <li>• Network connectivity issues</li>
            <li>• The service URL is incorrect</li>
            <li>• CORS or security policy restrictions</li>
          </ul>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (iframeRef.current) {
                iframeRef.current.src = service.url;
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading {service.name}...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={securityError ? 'about:blank' : service.url}
        className="w-full h-full border-0"
        sandbox={sandboxPolicies.length > 0 ? sandboxPolicies.join(' ') : 'allow-scripts allow-forms'}
        referrerPolicy="no-referrer"
        title={service.name}
        loading="lazy"
        allow="fullscreen"
        frameBorder="0"
        scrolling="auto"
        onLoad={() => {
          if (!securityError) {
            setIsLoading(false);
            setHasError(false);
          }
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
