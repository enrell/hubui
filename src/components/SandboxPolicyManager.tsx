"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Shield, AlertTriangle, Zap, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface SandboxPolicy {
  name: string;
  description: string;
  securityLevel: 'high' | 'medium' | 'low' | 'critical';
  enabled: boolean;
}

export interface SandboxPreset {
  name: string;
  description: string;
  icon: React.ReactNode;
  policies: string[];
  level: 'secure' | 'normal' | 'unsafe' | 'full';
}

const SANDBOX_POLICIES: Record<string, Omit<SandboxPolicy, 'enabled'>> = {
  'allow-scripts': {
    name: 'Allow Scripts',
    description: 'Allows JavaScript execution within the iframe. Required for most interactive web applications.',
    securityLevel: 'medium'
  },
  'allow-forms': {
    name: 'Allow Forms',
    description: 'Allows form submission from within the iframe. Required for login forms and user interactions.',
    securityLevel: 'medium'
  },
  'allow-popups': {
    name: 'Allow Popups',
    description: 'Allows the iframe to open popup windows. Some applications use popups for authentication or external links.',
    securityLevel: 'medium'
  },
  'allow-same-origin': {
    name: 'Allow Same Origin',
    description: 'Allows the iframe to access its own origin (cookies, localStorage, etc.). Increases functionality but reduces security isolation.',
    securityLevel: 'low'
  },
  'allow-modals': {
    name: 'Allow Modals',
    description: 'Allows the iframe to show modal dialogs (alert, confirm, prompt). May be needed for user confirmations.',
    securityLevel: 'medium'
  },
  'allow-orientation-lock': {
    name: 'Allow Orientation Lock',
    description: 'Allows the iframe to lock screen orientation. Useful for media players and games.',
    securityLevel: 'high'
  },
  'allow-pointer-lock': {
    name: 'Allow Pointer Lock',
    description: 'Allows the iframe to capture mouse pointer. Primarily used by games and 3D applications.',
    securityLevel: 'high'
  },
  'allow-presentation': {
    name: 'Allow Presentation',
    description: 'Allows the iframe to use the Presentation API for multi-screen presentations.',
    securityLevel: 'high'
  },
  'allow-top-navigation': {
    name: 'Allow Top Navigation',
    description: 'Allows the iframe to navigate the parent window. Can be a security risk as it may redirect users away.',
    securityLevel: 'critical'
  },
  'allow-downloads': {
    name: 'Allow Downloads',
    description: 'Allows the iframe to trigger file downloads. Required for applications that provide downloadable content.',
    securityLevel: 'medium'
  },
  'allow-storage-access-by-user-activation': {
    name: 'Allow Storage Access',
    description: 'Allows the iframe to request access to storage (cookies, localStorage) after user interaction.',
    securityLevel: 'low'
  }
};

const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    name: 'Secure',
    description: 'Basic functionality with strong security isolation',
    icon: <Shield className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms'],
    level: 'secure'
  },
  {
    name: 'Normal',
    description: 'Balanced security and functionality for most web applications',
    icon: <Settings className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms', 'allow-popups', 'allow-modals'],
    level: 'normal'
  },
  {
    name: 'Unsafe',
    description: 'Reduced security for applications requiring extended permissions',
    icon: <AlertTriangle className="h-4 w-4" />,
    policies: ['allow-scripts', 'allow-forms', 'allow-popups', 'allow-same-origin', 'allow-modals', 'allow-downloads'],
    level: 'unsafe'
  },
  {
    name: 'Full Compatibility',
    description: 'All permissions enabled - not recommended for untrusted content',
    icon: <Zap className="h-4 w-4" />,
    policies: Object.keys(SANDBOX_POLICIES),
    level: 'full'
  }
];

interface SandboxPolicyManagerProps {
  serviceId: string;
  onPolicyChange: (policies: string[]) => void;
  initialPolicies?: string[];
}

export default function SandboxPolicyManager({ 
  onPolicyChange, 
  initialPolicies = ['allow-scripts', 'allow-forms'] 
}: SandboxPolicyManagerProps) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>(initialPolicies);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  useEffect(() => {
    setSelectedPolicies(initialPolicies);
    
    const matchingPreset = SANDBOX_PRESETS.find(preset => 
      preset.policies.length === initialPolicies.length &&
      preset.policies.every(policy => initialPolicies.includes(policy))
    );
    
    setSelectedPreset(matchingPreset?.level || 'custom');
  }, [initialPolicies]);

  const handlePolicyToggle = (policyName: string, enabled: boolean) => {
    const newPolicies = enabled 
      ? [...selectedPolicies, policyName]
      : selectedPolicies.filter(p => p !== policyName);
    
    setSelectedPolicies(newPolicies);
    setSelectedPreset('custom');
    onPolicyChange(newPolicies);
  };

  const handlePresetChange = (presetLevel: string) => {
    setSelectedPreset(presetLevel);
    
    if (presetLevel !== 'custom') {
      const preset = SANDBOX_PRESETS.find(p => p.level === presetLevel);
      if (preset) {
        setSelectedPolicies(preset.policies);
        onPolicyChange(preset.policies);
      }
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPresetColor = (level: string) => {
    switch (level) {
      case 'secure': return 'bg-green-100 text-green-800 border-green-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unsafe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sandbox Policy Configuration
        </CardTitle>
        <CardDescription>
          Configure iframe security policies for this service. More permissive policies may improve compatibility but reduce security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="preset-select">Security Preset</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a security preset" />
            </SelectTrigger>
            <SelectContent>
              {SANDBOX_PRESETS.map((preset) => (
                <SelectItem key={preset.level} value={preset.level}>
                  <div className="flex items-center gap-2">
                    {preset.icon}
                    <span>{preset.name}</span>
                    <Badge className={getPresetColor(preset.level)} variant="secondary">
                      {preset.level}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Custom Configuration</span>
                  <Badge variant="outline">custom</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPreset !== 'custom' && (
            <div className="text-sm text-muted-foreground">
              {SANDBOX_PRESETS.find(p => p.level === selectedPreset)?.description}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Individual Policy Controls</Label>
          <div className="grid gap-3">
            {Object.entries(SANDBOX_POLICIES).map(([policyName, policy]) => (
              <div key={policyName} className="flex items-center justify-between space-x-3 p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`policy-${policyName}`}
                    checked={selectedPolicies.includes(policyName)}
                    onCheckedChange={(enabled) => handlePolicyToggle(policyName, !!enabled)}
                  />
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor={`policy-${policyName}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {policy.name}
                    </Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{policy.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Badge 
                  className={getSecurityLevelColor(policy.securityLevel)}
                  variant="secondary"
                >
                  {policy.securityLevel}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Current Sandbox Policy:</div>
          <code className="text-xs bg-background p-2 rounded border block">
            {selectedPolicies.length > 0 ? selectedPolicies.join(' ') : 'No policies selected (most restrictive)'}
          </code>
        </div>

        {selectedPolicies.includes('allow-same-origin') && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Security Warning</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              The &quot;allow-same-origin&quot; policy reduces security isolation. Only enable for trusted services.
            </p>
          </div>
        )}

        {selectedPolicies.includes('allow-top-navigation') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Critical Security Warning</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              The &quot;allow-top-navigation&quot; policy allows the service to redirect your browser. This is a significant security risk.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
