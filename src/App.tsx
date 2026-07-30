import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { BustaPaga } from './components/BustaPaga';
import { CertificazioneUnica } from './components/CertificazioneUnica';
import { AppState } from './types';

/**
 * Main Application Component
 * 
 * Handles navigation between different views:
 * - Home: Document selection screen
 * - Individual calculators: Busta Paga, Certificazione Unica, etc.
 * 
 * This component uses a simple state-based routing system.
 * For larger applications, consider using React Router.
 */
function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home',
  });

  /**
   * Navigate to a specific document calculator
   */
  const handleSelectDocument = (documentId: string) => {
    setAppState({
      currentView: documentId,
      selectedDocument: documentId,
    });
  };

  /**
   * Navigate back to home
   */
  const handleBackToHome = () => {
    setAppState({
      currentView: 'home',
    });
  };

  /**
   * Render the appropriate view based on current state
   */
  const renderView = () => {
    switch (appState.currentView) {
      case 'home':
        return <HomePage onSelectDocument={handleSelectDocument} />;

      case 'busta-paga':
        return <BustaPaga onBack={handleBackToHome} />;

      case 'certificazione-unica':
        return <CertificazioneUnica onBack={handleBackToHome} />;

      // Add more cases here as new calculators are implemented
      // case 'tfr':
      //   return <TFR onBack={handleBackToHome} />;

      default:
        // Fallback to home if unknown view
        return <HomePage onSelectDocument={handleSelectDocument} />;
    }
  };

  return (
    <div className="app">
      {renderView()}
    </div>
  );
}

export default App;
