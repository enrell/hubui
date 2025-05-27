"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
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
      }, 200);
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
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-destructive bg-destructive/5' : ''
      } ${isLongPressing ? 'scale-95 shadow-lg' : ''} ${
        selectionMode ? 'select-none' : ''
      }`}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={cancelLongPress}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={cancelLongPress}
      onContextMenu={handleContextMenu}
    >
      {(selectionMode || isLongPressing) && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected 
              ? 'bg-destructive border-destructive text-destructive-foreground scale-110' 
              : isLongPressing
              ? 'border-destructive bg-destructive/20 scale-110'
              : 'border-muted-foreground bg-background'
          }`}>
            {isSelected && <span className="text-xs font-bold">✓</span>}
            {isLongPressing && !isSelected && (
              <div className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate pr-8">{service.name}</h3>
          {!selectionMode && (
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground truncate mb-4">
          {service.url}
        </p>
        
        {!selectionMode && (
          <Link href={`/service/${encodeURIComponent(service.name)}`} className="block">
            <Button className="w-full touch-manipulation" size="sm">
              Open Service
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
