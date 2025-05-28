"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Edit, Save, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { getServices, removeService, updateService, updateServiceSandboxPolicies, type Service } from "@/lib/serviceStorage";
import SandboxPolicyManager from "./SandboxPolicyManager";

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
    
    const handleServicesUpdated = () => {
      loadServices();
    };
    
    window.addEventListener('servicesUpdated', handleServicesUpdated);
    return () => window.removeEventListener('servicesUpdated', handleServicesUpdated);
  }, []);

  const loadServices = () => {
    setServices(getServices());
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      removeService(service.id);
      loadServices();
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service.id);
    setEditName(service.name);
    setEditUrl(service.url);
  };

  const handleSave = (serviceId: string) => {
    if (!editName.trim() || !editUrl.trim()) {
      alert("Please fill in both name and URL");
      return;
    }
    
    updateService(serviceId, { name: editName.trim(), url: editUrl.trim() });
    setEditingService(null);
    loadServices();
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditName("");
    setEditUrl("");
  };

  const handleSandboxPolicyUpdate = (serviceId: string, policies: string[]) => {
    updateServiceSandboxPolicies(serviceId, policies);
    loadServices();
  };

  const getSecurityLevel = (policies: string[]) => {
    const riskyCombinations = [
      'allow-same-origin',
      'allow-downloads',
      'allow-storage-access-by-user-activation'
    ];
    
    const riskyCount = policies.filter(p => riskyCombinations.includes(p)).length;
    
    if (policies.length >= 8) return { level: 'full', color: 'bg-red-100 text-red-800 border-red-200' };
    if (riskyCount >= 2 || policies.length >= 6) return { level: 'unsafe', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (policies.length >= 4) return { level: 'normal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { level: 'secure', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const toggleExpanded = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Management
          </CardTitle>
          <CardDescription>
            No services configured yet. Add some services to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Service Management
        </CardTitle>
        <CardDescription>
          Manage your configured services and their security policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => {
            const security = getSecurityLevel(service.sandboxPolicies || []);
            const isEditing = editingService === service.id;
            const isExpanded = expandedService === service.id;
            
            return (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {isEditing ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Service name"
                          className="max-w-48"
                        />
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="Service URL"
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.url}</p>
                        </div>
                        <Badge className={security.color} variant="secondary">
                          {security.level}
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(service.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(service.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(service)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpanded(service.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(service)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {isExpanded && !isEditing && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Sandbox Security Policies</h4>
                    <SandboxPolicyManager
                      serviceId={service.id}
                      initialPolicies={service.sandboxPolicies || []}
                      onPolicyChange={(policies: string[]) => handleSandboxPolicyUpdate(service.id, policies)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
