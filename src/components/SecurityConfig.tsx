"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SecuritySettings {
  allowHttp: boolean;
  allowPrivateNetworks: boolean;
  requireHttps: boolean;
  blockSuspiciousDomains: boolean;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  allowHttp: true,
  allowPrivateNetworks: true,
  requireHttps: false,
  blockSuspiciousDomains: true
};

const SECURITY_STORAGE_KEY = 'hubui-security-settings';

export function getSecuritySettings(): SecuritySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(SECURITY_STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save security settings:', error);
  }
}

export default function SecurityConfig() {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(getSecuritySettings());
  }, []);

  const updateSetting = (key: keyof SecuritySettings, value: boolean) => {
    let newSettings = { ...settings, [key]: value };
    
    // Enforce mutual exclusivity between allowHttp and requireHttps
    if (key === 'requireHttps' && value === true) {
      // If requiring HTTPS, automatically disable allow HTTP
      newSettings = { ...newSettings, allowHttp: false };
    } else if (key === 'allowHttp' && value === true) {
      // If allowing HTTP, automatically disable require HTTPS
      newSettings = { ...newSettings, requireHttps: false };
    }
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSecuritySettings(settings);
    setHasChanges(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('securitySettingsUpdated'));
    
    alert('Security settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const getSecurityMode = () => {
    if (settings.requireHttps && !settings.allowPrivateNetworks) {
      return { mode: "External Only", color: "text-blue-600 dark:text-blue-400", description: "HTTPS required, no local services" };
    } else if (settings.requireHttps && settings.allowPrivateNetworks) {
      return { mode: "Mixed Mode", color: "text-purple-600 dark:text-purple-400", description: "HTTPS required for external, local allowed" };
    } else if (settings.allowHttp && settings.allowPrivateNetworks) {
      return { mode: "Local Friendly", color: "text-green-600 dark:text-green-400", description: "Optimized for local services" };
    } else if (settings.allowHttp && !settings.allowPrivateNetworks) {
      return { mode: "External HTTP", color: "text-yellow-600 dark:text-yellow-400", description: "HTTP allowed, no local services" };
    } else {
      return { mode: "Restricted", color: "text-red-600 dark:text-red-400", description: "No protocols allowed" };
    }
  };

  const securityMode = getSecurityMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔒 Security Settings
        </CardTitle>
        <CardDescription>
          Configure security policies for iframe embedding. These settings affect how services are validated before being added.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <h4 className="font-medium text-sm">Current Security Mode</h4>
            <p className="text-xs text-muted-foreground">{securityMode.description}</p>
          </div>
          <span className={`font-medium text-sm ${securityMode.color}`}>
            {securityMode.mode}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allowHttp" className={settings.requireHttps ? "text-muted-foreground" : ""}>
                Allow HTTP URLs
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow services using HTTP protocol (not recommended for external services)
                {settings.requireHttps && <span className="block text-xs text-orange-600 dark:text-orange-400">Disabled because HTTPS is required</span>}
              </p>
            </div>
            <input
              id="allowHttp"
              type="checkbox"
              checked={settings.allowHttp}
              disabled={settings.requireHttps}
              onChange={(e) => updateSetting('allowHttp', e.target.checked)}
              className="h-4 w-4 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allowPrivateNetworks">Allow Private Networks</Label>
              <p className="text-sm text-muted-foreground">
                Allow services on private network ranges (192.168.x.x, 10.x.x.x, etc.)
              </p>
            </div>
            <input
              id="allowPrivateNetworks"
              type="checkbox"
              checked={settings.allowPrivateNetworks}
              onChange={(e) => updateSetting('allowPrivateNetworks', e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="requireHttps" className={settings.allowHttp ? "text-muted-foreground" : ""}>
                Require HTTPS
              </Label>
              <p className="text-sm text-muted-foreground">
                Only allow HTTPS URLs (most secure, but may block local development services)
                {settings.allowHttp && <span className="block text-xs text-orange-600 dark:text-orange-400">Disabled because HTTP is allowed</span>}
              </p>
            </div>
            <input
              id="requireHttps"
              type="checkbox"
              checked={settings.requireHttps}
              disabled={settings.allowHttp}
              onChange={(e) => updateSetting('requireHttps', e.target.checked)}
              className="h-4 w-4 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="blockSuspiciousDomains">Block Suspicious Domains</Label>
              <p className="text-sm text-muted-foreground">
                Block known malicious domains and suspicious URL patterns
              </p>
            </div>
            <input
              id="blockSuspiciousDomains"
              type="checkbox"
              checked={settings.blockSuspiciousDomains}
              onChange={(e) => updateSetting('blockSuspiciousDomains', e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-sm mb-2">Security Recommendations:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• For local services (Jellyfin, etc.): Keep &quot;Allow Private Networks&quot; enabled</li>
              <li>• For maximum security with external services: Enable &quot;Require HTTPS&quot;</li>
              <li>• For local development: Enable &quot;Allow HTTP&quot; (default for local services)</li>
              <li>• Always keep &quot;Block Suspicious Domains&quot; enabled</li>
              <li>• Review each service before adding it to your dashboard</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges}
              className="flex-1"
            >
              Save Settings
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline"
              className="flex-1"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
