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
 */
function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home',
  });

  // Additional states for formula validation and red borders inside BustaPaga or inline if needed
  const [formula, setFormula] = useState<'netto' | 'tfr'>('netto');
  const [competenze, setCompetenze] = useState('');
  const [trattenute, setTrattenute] = useState('');
  const [tfrVal, setTfrVal] = useState('');
  const [errors, setErrors] = useState({ comp: false, tratt: false, tfr: false });

  const handleCalc = () => {
    setErrors({
      comp: formula === 'netto' && !competenze.trim(),
      tratt: formula === 'netto' && !trattenute.trim(),
      tfr: formula === 'tfr' && !tfrVal.trim(),
    });
  };

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
        return (
          <div className="p-6">
            <button 
              onClick={handleBackToHome}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              ← Back to Home
            </button>
            
            {/* Red border validation UI integrated with your structure */}
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => { setFormula('netto'); setErrors({comp: false, tratt: false, tfr: false}); }}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium ${formula === 'netto' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
                >
                  Netto Busta
                </button>
                <button 
                  onClick={() => { setFormula('tfr'); setErrors({comp: false, tratt: false, tfr: false}); }}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium ${formula === 'tfr' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
                >
                  TFR Annuo
                </button>
              </div>

              {formula === 'netto' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Totale Competenze</label>
                    <input
                      type="text"
                      value={competenze}
                      onChange={(e) => { setCompetenze(e.target.value); setErrors(prev => ({...prev, comp: false})); }}
                      className={`w-full p-2 border rounded-lg text-sm ${errors.comp ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Totale Trattenute</label>
                    <input
                      type="text"
                      value={trattenute}
                      onChange={(e) => { setTrattenute(e.target.value); setErrors(prev => ({...prev, tratt: false})); }}
                      className={`w-full p-2 border rounded-lg text-sm ${errors.tratt ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Retribuzione Utile TFR</label>
                  <input
                    type="text"
                    value={tfrVal}
                    onChange={(e) => { setTfrVal(e.target.value); setErrors(prev => ({...prev, tfr: false})); }}
                    className={`w-full p-2 border rounded-lg text-sm ${errors.tfr ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
              )}

              <button
                onClick={handleCalc}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Calculate
              </button>
            </div>
          </div>
        );
      
      case 'certificazione-unica':
        return <CertificazioneUnica onBack={handleBackToHome} />;
      
      default:
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
