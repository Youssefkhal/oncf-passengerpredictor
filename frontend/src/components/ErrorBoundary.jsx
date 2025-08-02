import React from 'react';
import Button from './ui/Button';
import Icon from './AppIcon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console or external service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-elevation-2 p-6 text-center">
            <div className="mb-4">
              <Icon name="AlertTriangle" size={48} className="text-destructive mx-auto" />
            </div>
            
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Oups ! Quelque chose s'est mal passé
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                fullWidth
                leftIcon="RefreshCw"
              >
                Réessayer
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                fullWidth
                leftIcon="RotateCcw"
              >
                Recharger la page
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-foreground mb-2">
                  Détails de l'erreur (Développement)
                </summary>
                <div className="bg-muted p-3 rounded text-xs font-mono text-foreground overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Erreur:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 