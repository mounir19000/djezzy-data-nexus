import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="p-8 flex flex-col items-center text-center relative border-b border-border-subtle">
           {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(to_right,#e2e2e8_1px,transparent_1px),linear-gradient(to_bottom,#e2e2e8_1px,transparent_1px)] bg-[size:36px_36px]" />
          
          <div className="relative z-10 w-16 h-16 rounded-lg bg-status-critical/10 border border-status-critical/30 flex items-center justify-center mb-6">
            <SearchX className="w-8 h-8 text-status-critical" />
          </div>
          <div className="relative z-10 mb-4">
            <h2 className="text-3xl font-display font-bold text-on-surface mt-2">Cette page est introuvable.</h2>
            <p className="text-on-surface-variant mt-3 text-sm max-w-sm mx-auto">
              Aucun souci, retournons vers une zone connue de la plateforme.
            </p>
          </div>
        </div>

        <div className="p-6 bg-background flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-11 px-4 rounded-md border border-border-subtle text-on-surface hover:bg-bg-surface transition-colors inline-flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-on-surface-variant" />
            Retour
          </button>
          <Link 
            to="/" 
            className="flex-1 h-11 px-4 rounded-md bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors inline-flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
