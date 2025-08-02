import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const BreadcrumbNavigation = () => {
  const location = useLocation();

  const routeLabels = {
    '/': 'Accueil',
    '/main-dashboard': 'Tableau de Bord',
    '/data-upload-management': 'Gestion des Données',
    '/prediction-interface': 'Interface de Prédiction',
    '/model-training-center': 'Centre d\'Entraînement des Modèles'
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        path: '/',
        label: 'Accueil',
        icon: 'Home'
      }
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        path: currentPath,
        label,
        icon: null
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          )}
          
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">
              {breadcrumb.icon && (
                <Icon name={breadcrumb.icon} size={16} className="inline mr-1" />
              )}
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-foreground transition-colors flex items-center"
            >
              {breadcrumb.icon && (
                <Icon name={breadcrumb.icon} size={16} className="mr-1" />
              )}
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation; 