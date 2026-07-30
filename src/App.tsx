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


import React, { useState, useMemo } from 'react';
import { 
  Calculator, Search, RefreshCw, AlertCircle, 
  ChevronRight, DollarSign, PieChart, Layers, HelpCircle 
} from 'lucide-react';

// --- Data Types ---
interface ComponentItem {
  id: string;
  name: string;
  itName: string;
  category: 'competenze' | 'trattenute' | 'tfr' | 'other';
  value: number;
  requiredFor: string[];
}

export default function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'standard' | 'multi' | 'target'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<'netto' | 'tfr_anno' | 'tfr_spettante'>('netto');
  
  // Input values mapping
  const [inputs, setInputs] = useState<Record<string, string>>({
    tot_competenze: '',
    tot_trattenute: '',
    arr_preced: '',
    arr_attuale: '',
    retribuzione_utile_tfr: '',
    contr_agg_tfr: '',
    tfr_mese: '',
    fdo_tfr_ap: '',
    anticipazioni_anno: '',
    target_netto: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // --- Component List ---
  const componentsList: ComponentItem[] = [
    { id: 'tot_competenze', name: 'Total Competenze', itName: 'Totale Competenze', category: 'competenze', value: 0, requiredFor: ['netto'] },
    { id: 'tot_trattenute', name: 'Total Trattenute', itName: 'Totale Trattenute', category: 'trattenute', value: 0, requiredFor: ['netto'] },
    { id: 'arr_preced', name: 'Arretrati Anno Precedente', itName: 'Arretrati Prec.', category: 'other', value: 0, requiredFor: [] },
    { id: 'arr_attuale', name: 'Arretrati Anno Corrente', itName: 'Arretrati Attuale', category: 'other', value: 0, requiredFor: [] },
    { id: 'retribuzione_utile_tfr', name: 'Retribuzione Utile TFR', itName: 'Retrib. Utile TFR', category: 'tfr', value: 0, requiredFor: ['tfr_anno'] },
    { id: 'contr_agg_tfr', name: 'Contributo Aggiornamento TFR', itName: 'Contr. Agg. TFR', category: 'tfr', value: 0, requiredFor: [] },
    { id: 'tfr_mese', name: 'TFR Mese', itName: 'TFR Mese', category: 'tfr', value: 0, requiredFor: [] },
    { id: 'fdo_tfr_ap', name: 'Fondo TFR 31/12 AP', itName: 'F.do TFR 31/12 AP', category: 'tfr', value: 0, requiredFor: ['tfr_spettante'] },
    { id: 'anticipazioni_anno', name: 'Anticipazioni Anno', itName: 'Anticipazioni Anno', category: 'tfr', value: 0, requiredFor: [] },
  ];

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    return componentsList.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle number inputs cleanly (preserving leading zeros like 0.04)
  const handleInputChange = (id: string, val: string) => {
    setInputs(prev => ({ ...prev, [id]: val }));
    // Clear error when user types
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: false }));
    }
  };

  // --- Calculations ---
  const compVal = (id: string) => parseFloat(inputs[id]) || 0;

  const calculatedNetto = compVal('tot_competenze') - compVal('tot_trattenute') + compVal('arr_preced') + compVal('arr_attuale');
  const calculatedTfrAnnuo = (compVal('retribuzione_utile_tfr') / 13.5) + compVal('contr_agg_tfr');
  const calculatedTfrSpettante = compVal('fdo_tfr_ap') + calculatedTfrAnnuo - compVal('anticipazioni_anno');

  // Validate and Calculate
  const handleCalculate = () => {
    const errors: Record<string, boolean> = {};
    let isValid = true;

    // Contextual validation based on active formula
    if (selectedFormula === 'netto') {
      if (!inputs['tot_competenze']) { errors['tot_competenze'] = true; isValid = false; }
      if (!inputs['tot_trattenute']) { errors['tot_trattenute'] = true; isValid = false; }
    } else if (selectedFormula === 'tfr_anno') {
      if (!inputs['retribuzione_utile_tfr']) { errors['retribuzione_utile_tfr'] = true; isValid = false; }
    } else if (selectedFormula === 'tfr_spettante') {
      if (!inputs['fdo_tfr_ap']) { errors['fdo_tfr_ap'] = true; isValid = false; }
    }

    setValidationErrors(errors);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Navigation / Mode Tabs */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'standard' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Standard Mode
          </button>
          <button
            onClick={() => setActiveTab('multi')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'multi' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Multi Calculation
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'target' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Target Mode
          </button>
        </div>

        {/* Main Workspace Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          
          {/* Formula Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedFormula('netto')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFormula === 'netto' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-semibold uppercase">Formula 1</div>
              <div className="text-sm font-bold text-gray-800">Netto in Busta</div>
            </button>
            <button
              onClick={() => setSelectedFormula('tfr_anno')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFormula === 'tfr_anno' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-semibold uppercase">Formula 2</div>
              <div className="text-sm font-bold text-gray-800">TFR Annuo Progr.</div>
            </button>
            <button
              onClick={() => setSelectedFormula('tfr_spettante')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFormula === 'tfr_spettante' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-semibold uppercase">Formula 3</div>
              <div className="text-sm font-bold text-gray-800">TFR Spettante Azienda</div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search components (e.g. Competenze, TFR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Scrollable Component Cards Container (Max 4 lines height with smooth scroll) */}
          <div className="max-h-72 overflow-y-auto pr-2 space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
            {filteredComponents.length > 0 ? (
              filteredComponents.map((comp) => {
                const isError = validationErrors[comp.id];
                return (
                  <div 
                    key={comp.id} 
                    className={`flex items-center justify-between p-3 bg-white rounded-xl border transition-all ${
                      isError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded mr-2 uppercase">
                        {comp.category}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{comp.name}</span>
                      <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({comp.itName})</span>
                    </div>
                    <div className="w-36">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={inputs[comp.id]}
                        onChange={(e) => handleInputChange(comp.id, e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border text-right focus:outline-none transition-colors ${
                          isError 
                            ? 'border-red-500 bg-red-50/20 text-red-900' 
                            : 'border-gray-300 focus:border-gray-900 bg-white text-gray-800'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">No components found</div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            Calculate Results
          </button>

          {/* Results Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">Netto in Busta</div>
              <div className="text-lg font-bold text-gray-900 mt-1">€ {calculatedNetto.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">TFR Annuo Progr.</div>
              <div className="text-lg font-bold text-gray-900 mt-1">€ {calculatedTfrAnnuo.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">TFR Spettante Azienda</div>
              <div className="text-lg font-bold text-gray-900 mt-1">€ {calculatedTfrSpettante.toFixed(2)}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
