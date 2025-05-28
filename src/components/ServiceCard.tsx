"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Lock, CheckCircle2, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/lib/serviceStorage";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  selectionMode: boolean;
}

export default function ServiceCard({ 
  service, 
  isSelected, 
  onSelectionChange, 
  selectionMode 
}: ServiceCardProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if this is a local service
  const isLocalService = service.url.includes('localhost') ||
                         service.url.includes('127.0.0.1') ||
                         service.url.includes('192.168.') ||
                         service.url.includes('10.0.') ||
                         service.url.includes('172.');

  // Get domain from URL for display
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.port ? `:${urlObj.port}` : '');
    } catch {
      return url;
    }
  };

  // Get service icon based on URL or name
  const getServiceIcon = () => {
    const name = service.name.toLowerCase();
    const url = service.url.toLowerCase();
    
    if (name.includes('jellyfin') || url.includes('jellyfin')) return '🎬';
    if (name.includes('portainer') || url.includes('portainer')) return '🐳';
    if (name.includes('grafana') || url.includes('grafana')) return '📊';
    if (name.includes('prometheus') || url.includes('prometheus')) return '📈';
    if (name.includes('nextcloud') || url.includes('nextcloud')) return '☁️';
    if (name.includes('plex') || url.includes('plex')) return '📺';
    if (name.includes('home assistant') || url.includes('homeassistant')) return '🏠';
    if (name.includes('pihole') || url.includes('pihole')) return '🕳️';
    if (name.includes('sonarr') || url.includes('sonarr')) return '📺';
    if (name.includes('radarr') || url.includes('radarr')) return '🎬';
    if (name.includes('bazarr') || url.includes('bazarr')) return '💬';
    if (name.includes('prowlarr') || url.includes('prowlarr')) return '🔍';
    if (name.includes('lidarr') || url.includes('lidarr')) return '🎵';
    if (name.includes('overseerr') || url.includes('overseerr')) return '📋';
    if (name.includes('tautulli') || url.includes('tautulli')) return '📊';
    if (name.includes('ombi') || url.includes('ombi')) return '🎬';
    if (name.includes('jackett') || url.includes('jackett')) return '🔧';
    if (name.includes('transmission') || url.includes('transmission')) return '⬇️';
    if (name.includes('qbittorrent') || url.includes('qbittorrent')) return '⬇️';
    if (name.includes('nginx') || url.includes('nginx')) return '🌐';
    if (name.includes('gitlab') || url.includes('gitlab')) return '🦊';
    if (name.includes('github') || url.includes('github')) return '🐙';
    if (name.includes('jenkins') || url.includes('jenkins')) return '👷';
    if (name.includes('docker') || url.includes('docker')) return '🐳';
    if (name.includes('kubernetes') || url.includes('kubernetes')) return '⚙️';
    if (name.includes('elasticsearch') || url.includes('elasticsearch')) return '🔍';
    if (name.includes('kibana') || url.includes('kibana')) return '📊';
    if (name.includes('redis') || url.includes('redis')) return '🗄️';
    if (name.includes('postgres') || url.includes('postgres')) return '🐘';
    if (name.includes('mysql') || url.includes('mysql')) return '🗄️';
    if (name.includes('mongo') || url.includes('mongo')) return '🍃';
    
    return '🌐';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectionMode) {
      onSelectionChange(!isSelected);
    }
  };

  const startLongPress = () => {
    if (!selectionMode) {
      setIsLongPressing(true);
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(false);
        onSelectionChange(true);
      }, 600);
    }
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleMouseDown = () => {
    startLongPress();
  };

  const handleMouseUp = () => {
    cancelLongPress();
  };

  const handleTouchStart = () => {
    startLongPress();
  };

  const handleTouchEnd = () => {
    cancelLongPress();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectionMode) {
      onSelectionChange(true);
    }
  };

  return (
    <Card 
      className={`relative group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm ${
        isSelected ? 'ring-2 ring-destructive bg-destructive/5 shadow-lg translate-y-0' : ''
      } ${isLongPressing ? 'scale-95 shadow-xl' : ''} ${
        selectionMode ? 'select-none' : ''
      }`}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        cancelLongPress();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={cancelLongPress}
      onContextMenu={handleContextMenu}
    >
      {/* Selection indicator */}
      {(selectionMode || isLongPressing) && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
            isSelected 
              ? 'bg-destructive border-destructive text-destructive-foreground scale-110'
              : isLongPressing
              ? 'border-destructive bg-destructive/20 scale-110'
              : 'border-muted bg-background'
          }`}>
            {isSelected && <CheckCircle2 className="w-4 h-4" />}
            {isLongPressing && !isSelected && (
              <div className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      )}

      {/* More options indicator (only shown on hover when not in selection mode) */}
      {!selectionMode && isHovered && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 rounded-full bg-muted/80 backdrop-blur flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
            <MoreVertical className="w-3 h-3" />
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {/* Service icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
            {getServiceIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {getDomain(service.url)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Service badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={isLocalService ? "default" : "secondary"}
            className="text-xs px-2 py-1"
          >
            {isLocalService ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Local
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 mr-1" />
                External
              </>
            )}
          </Badge>
          
          {service.url.startsWith('https://') && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <Lock className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          )}
        </div>
        
        {!selectionMode && (
          <Link href={`/service/${encodeURIComponent(service.name)}`} className="block">
            <Button 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
              variant="secondary"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Service
            </Button>
          </Link>
        )}

        {selectionMode && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              {isSelected ? 'Selected for deletion' : 'Tap to select'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}