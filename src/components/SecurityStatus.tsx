"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSecuritySettings } from "@/components/SecurityConfig";

interface SecurityStatusItem {
  label: string;
  status: 'secure' | 'warning' | 'danger';
  description: string;
  recommendation?: string;
}

export default function SecurityStatus() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatusItem[]>([]);

  useEffect(() => {
    const updateSecurityStatus = () => {
      const settings = getSecuritySettings();
      const status: SecurityStatusItem[] = [];

      // Check HTTPS requirement
      if (settings.requireHttps) {
        status.push({
          label: "HTTPS Required",
          status: 'secure',
          description: "Only HTTPS URLs are allowed"
        });
      } else if (!settings.allowHttp) {
        status.push({
          label: "HTTP Blocked",
          status: 'secure',
          description: "HTTP URLs are not allowed"
        });
      } else {
        status.push({
          label: "HTTP Allowed",
          status: 'warning',
          description: "HTTP URLs are permitted",
          recommendation: "Consider requiring HTTPS for better security"
        });
      }

      // Check private network access
      if (settings.allowPrivateNetworks) {
        status.push({
          label: "Private Networks Allowed",
          status: 'warning',
          description: "Services on private networks (192.168.x.x, etc.) are allowed",
          recommendation: "This is normal for local development but increases attack surface"
        });
      } else {
        status.push({
          label: "Private Networks Blocked",
          status: 'secure',
          description: "Private network access is restricted"
        });
      }

      // Check suspicious domain blocking
      if (settings.blockSuspiciousDomains) {
        status.push({
          label: "Suspicious Domains Blocked",
          status: 'secure',
          description: "Known malicious domains are blocked"
        });
      } else {
        status.push({
          label: "Suspicious Domain Blocking Disabled",
          status: 'danger',
          description: "Malicious domains are not being blocked",
          recommendation: "Enable suspicious domain blocking immediately"
        });
      }

      // Iframe security
      status.push({
        label: "Iframe Sandboxing",
        status: 'secure',
        description: "Iframes use restricted sandbox permissions"
      });

      status.push({
        label: "CSP Headers",
        status: 'secure',
        description: "Content Security Policy headers are active"
      });

      setSecurityStatus(status);
    };

    updateSecurityStatus();

    // Listen for security settings changes
    const handleSettingsUpdate = () => updateSecurityStatus();
    window.addEventListener('securitySettingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('securitySettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const getStatusIcon = (status: SecurityStatusItem['status']) => {
    switch (status) {
      case 'secure': return '🟢';
      case 'warning': return '🟡';
      case 'danger': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: SecurityStatusItem['status']) => {
    switch (status) {
      case 'secure': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'danger': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Security Status
        </CardTitle>
        <CardDescription>
          Current security configuration and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityStatus.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              <span className="text-lg mt-0.5">{getStatusIcon(item.status)}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{item.label}</h4>
                  <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.recommendation && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                    💡 {item.recommendation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Security Overview:</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {securityStatus.filter(s => s.status === 'secure').length}
              </div>
              <div className="text-xs text-muted-foreground">Secure</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {securityStatus.filter(s => s.status === 'warning').length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {securityStatus.filter(s => s.status === 'danger').length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
