import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const LoadingStateManager = ({ 
  type = "default",
  message = "Chargement...",
  progress,
  estimatedTime,
  overlay = false,
  size = "default",
  className 
}) => {
  const loadingConfigs = {
    default: {
      icon: "Loader2",
      animation: "animate-spin",
      color: "text-primary"
    },
    "model-training": {
      icon: "Brain",
      animation: "animate-pulse",
      color: "text-accent"
    },
    "data-processing": {
      icon: "Database",
      animation: "animate-bounce",
      color: "text-success"
    },
    prediction: {
      icon: "TrendingUp",
      animation: "animate-pulse",
      color: "text-warning"
    },
    skeleton: {
      icon: null,
      animation: "animate-pulse",
      color: "text-muted-foreground"
    }
  };

  const sizeConfigs = {
    xs: "text-xs",
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  const iconSizeConfigs = {
    xs: 16,
    sm: 20,
    default: 24,
    lg: 32,
    xl: 40
  };

  const config = loadingConfigs[type];
  const sizeClass = sizeConfigs[size];
  const iconSize = iconSizeConfigs[size];

  if (type === "skeleton") {
    return (
      <div className={cn(
        "animate-pulse bg-muted rounded",
        size === "xs" && "h-4",
        size === "sm" && "h-6",
        size === "default" && "h-8",
        size === "lg" && "h-12",
        size === "xl" && "h-16",
        className
      )} />
    );
  }

  const LoadingContent = () => (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4 p-6",
      className
    )}>
      {config.icon && (
        <Icon 
          name={config.icon} 
          size={iconSize} 
          className={cn(config.animation, config.color)} 
        />
      )}
      
      <div className="text-center space-y-2">
        <p className={cn("font-medium", sizeClass)}>
          {message}
        </p>
        
        {progress !== undefined && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {estimatedTime && (
          <p className="text-xs text-muted-foreground">
            Temps estimé: {estimatedTime}
          </p>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg shadow-elevation-3">
          <LoadingContent />
        </div>
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingStateManager; 