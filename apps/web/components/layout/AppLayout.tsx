import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SEOMeta from '../shared/SEOMeta';
// PageTransitionWrapper moved to _app.tsx

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

interface AppLayoutProps {
  children: ReactNode;
  seo?: SEOProps;
  showBackLink?: boolean;
  minimal?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  seo,
  showBackLink = false,
  minimal = false
}) => {
  return (
    <div className="min-h-screen bg-useless-dark">
        {seo && (
          <SEOMeta
            title={seo.title}
            description={seo.description}
            image={seo.image}
            url={seo.url}
            type={seo.type}
          />
        )}
        
        <Header isMinimal={minimal} showBackLink={showBackLink} />
        
        <main className={`${minimal ? 'max-w-2xl' : 'max-w-xl'} mx-auto px-4 sm:px-6 py-12`}>
          {children}
        </main>
        
        <Footer minimal={minimal} />
      </div>
  );
};

export default AppLayout;
