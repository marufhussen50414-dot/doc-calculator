import React from 'react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formula Modal Component
 * 
 * Displays Formula 1 through Formula 14 and their sub-formulas.
 */
export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📐 Formulas and Calculation Logic</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Formula 1 & Sub-formulas */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">
              Formula 1
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-indigo-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-indigo-600">NETTO IN BUSTA</span> ={' '}
                <span className="font-bold text-green-600">TOTALE COMPETENZE</span> -{' '}
                (<span className="font-bold text-red-600">TOTALE TRATTENUTE</span> +{' '}
                (± <span className="font-bold text-orange-600">ARR. PRECED.</span>)) ±{' '}
                <span className="font-bold text-blue-600">ARR. ATTUALE</span>
              </div>
            </div>

            <div className="mt-4 border-t border-indigo-200 pt-4">
              <h4 className="text-sm font-bold text-indigo-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>
              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE COMPETENZE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    COMPETENZE = NETTO + (TRATTENUTE + ARR. PRECED.) - ARR. ATTUALE
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE TRATTENUTE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TRATTENUTE = COMPETENZE - NETTO - ARR. PRECED. + ARR. ATTUALE
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate ARR. PRECED.:
                  </span>
                  <div className="text-gray-900 mt-1">
                    ARR. PRECED. = COMPETENZE - NETTO - TRATTENUTE + ARR. ATTUALE
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate ARR. ATTUALE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    ARR. ATTUALE = NETTO + TRATTENUTE + ARR. PRECED. - COMPETENZE
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 2 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-3">
              Formula 2 (TFR Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-emerald-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-emerald-700">TFR Spettante Azienda</span> ={' '}
                <span className="font-bold text-gray-700">F.do TFR al 31/12 AP</span> +{' '}
                <span className="font-bold text-teal-600">TFR Annuo Progr.</span>
              </div>
            </div>

            <div className="mt-4 border-t border-emerald-200 pt-4">
              <h4 className="text-sm font-bold text-emerald-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>
              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate F.do TFR al 31/12 AP:
                  </span>
                  <div className="text-gray-900 mt-1">
                    F.do TFR al 31/12 AP = TFR Spettante Azienda - TFR Annuo Progr.
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TFR Annuo Progr.:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TFR Annuo Progr. = TFR Spettante Azienda - F.do TFR al 31/12 AP
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 3 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              Formula 3 (Totale Trattenute Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-amber-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-red-600">TOTALE TRATTENUTE</span> ={' '}
                (<span className="font-bold text-purple-600">IRPEF + IMP. SOST.</span>) +{' '}
                <span className="font-bold text-amber-700">TOTALE CONTRIBUTI</span> +{' '}
                <span className="font-bold text-orange-600">ADDIZIONALI</span>
              </div>
            </div>

            <div className="mt-4 border-t border-amber-200 pt-4">
              <h4 className="text-sm font-bold text-amber-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>
              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IRPEF + IMP. SOST.:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IRPEF + IMP. SOST. = TOTALE TRATTENUTE - TOTALE CONTRIBUTI - ADDIZIONALI
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE CONTRIBUTI:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TOTALE CONTRIBUTI = TOTALE TRATTENUTE - (IRPEF + IMP. SOST.) - ADDIZIONALI
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate ADDIZIONALI:
                  </span>
                  <div className="text-gray-900 mt-1">
                    ADDIZIONALI = TOTALE TRATTENUTE - (IRPEF + IMP. SOST.) - TOTALE CONTRIBUTI
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 4 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              Formula 4 (IRPEF + IMP. SOST.)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-purple-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-purple-700">IRPEF + IMP. SOST.</span> ={' '}
                <span className="font-bold text-gray-700">IRPEF LORDA</span> -{' '}
                <span className="font-bold text-pink-600">DETR. LAV. DIPENDENTE</span> +{' '}
                <span className="font-bold text-indigo-600">IMPOSTA SOSTITUTIVA</span>
              </div>
            </div>

            <div className="mt-4 border-t border-purple-200 pt-4">
              <h4 className="text-sm font-bold text-purple-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>
              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IRPEF LORDA:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IRPEF LORDA = (IRPEF + IMP. SOST.) + DETR. LAV. DIPENDENTE - IMPOSTA SOSTITUTIVA
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate DETR. LAV. DIPENDENTE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    DETR. LAV. DIPENDENTE = IRPEF LORDA - (IRPEF + IMP. SOST.) + IMPOSTA SOSTITUTIVA
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IMPOSTA SOSTITUTIVA:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IMPOSTA SOSTITUTIVA = (IRPEF + IMP. SOST.) - IRPEF LORDA + DETR. LAV. DIPENDENTE
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 5 */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-900 mb-3">
              Formula 5 (IRPEF LORDA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-cyan-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-cyan-700">IRPEF LORDA (Monthly)</span> ={' '}
                <span className="font-bold text-blue-700">IMPONIBILE FISCALE (Monthly)</span> ×{' '}
                <span className="font-bold text-gray-700">23%</span>
              </div>
            </div>

            <div className="mt-4 border-t border-cyan-200 pt-4">
              <h4 className="text-sm font-bold text-cyan-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IMPONIBILE FISCALE (Monthly):
                  </span>
                  <div className="text-gray-900 mt-1">
                    IMPONIBILE FISCALE (Monthly) = IRPEF LORDA (Monthly) / 0.23
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula 6 */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-rose-900 mb-3">
              Formula 6 (TFR MESE Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-rose-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-rose-700">TFR MESE</span> = (
                <span className="font-bold text-red-600">RETRIBUZIONE UTILE TFR</span> /{' '}
                <span className="font-bold text-gray-700">13.5</span>) -{' '}
                <span className="font-bold text-orange-600">CONTR. AGG. TFR</span>
              </div>
            </div>

            <div className="mt-4 border-t border-rose-200 pt-4">
              <h4 className="text-sm font-bold text-rose-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate RETRIBUZIONE UTILE TFR:
                  </span>
                  <div className="text-gray-900 mt-1">
                    RETRIBUZIONE UTILE TFR = (TFR MESE + CONTR. AGG. TFR) × 13.5
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate CONTR. AGG. TFR:
                  </span>
                  <div className="text-gray-900 mt-1">
                    CONTR. AGG. TFR = (RETRIBUZIONE UTILE TFR / 13.5) - TFR MESE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula 7 */}
          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-violet-900 mb-3">
              Formula 7 (IRPEF NETTA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-violet-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-violet-700">IRPEF NETTA (Monthly)</span> ={' '}
                <span className="font-bold text-gray-700">IRPEF LORDA</span> -{' '}
                <span className="font-bold text-pink-600">DETR. LAV. DIPENDENTE</span>
              </div>
            </div>

            <div className="mt-4 border-t border-violet-200 pt-4">
              <h4 className="text-sm font-bold text-violet-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IRPEF LORDA:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IRPEF LORDA = IRPEF NETTA (Monthly) + DETR. LAV. DIPENDENTE
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate DETR. LAV. DIPENDENTE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    DETR. LAV. DIPENDENTE = IRPEF LORDA - IRPEF NETTA (Monthly)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula 8 */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-900 mb-3">
              Formula 8 (CONTR. AGG. TFR Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-teal-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-teal-700">CONTR. AGG. TFR</span> ={' '}
                <span className="font-bold text-cyan-600">IMPON. CONTRIB. ARROT. MESE</span> ×{' '}
                <span className="font-bold text-gray-700">0,005</span>
              </div>
            </div>

            <div className="mt-4 border-t border-teal-200 pt-4">
              <h4 className="text-sm font-bold text-teal-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IMPON. CONTRIB. ARROT. MESE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IMPON. CONTRIB. ARROT. MESE = CONTR. AGG. TFR / 0,005
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula 9 */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-rose-900 mb-3">
              Formula 9 (IRPEF NETTA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-rose-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-rose-700">IRPEF NETTA</span> ={' '}
                <span className="font-bold text-pink-600">TOTALE TRATTENUTE</span> -{' '}
                <span className="font-bold text-orange-600">TOTALE CONTRIBUTI</span> -{' '}
                <span className="font-bold text-purple-600">ADDIZIONALI</span> -{' '}
                <span className="font-bold text-blue-600">IMPOSTA SOSTITUTIVA</span>
              </div>
            </div>

            <div className="mt-4 border-t border-rose-200 pt-4">
              <h4 className="text-sm font-bold text-rose-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE TRATTENUTE:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TOTALE TRATTENUTE = IRPEF NETTA + TOTALE CONTRIBUTI + ADDIZIONALI + IMPOSTA SOSTITUTIVA
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE CONTRIBUTI:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TOTALE CONTRIBUTI = TOTALE TRATTENUTE - IRPEF NETTA - ADDIZIONALI - IMPOSTA SOSTITUTIVA
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate ADDIZIONALI:
                  </span>
                  <div className="text-gray-900 mt-1">
                    ADDIZIONALI = TOTALE TRATTENUTE - TOTALE CONTRIBUTI - IRPEF NETTA - IMPOSTA SOSTITUTIVA
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IMPOSTA SOSTITUTIVA:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IMPOSTA SOSTITUTIVA = TOTALE TRATTENUTE - TOTALE CONTRIBUTI - ADDIZIONALI - IRPEF NETTA
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 10 */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-sky-900 mb-3">
              Formula 10 (IMPONIBILE FISCALE Calculation)
            </h3>

            {/* Main Formula Box */}
            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-sky-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-sky-700">IMPONIBILE FISCALE</span> ={' '}
                <span className="font-bold text-indigo-600">IMPONIBILE CONTRIBUTIVO</span> -{' '}
                <span className="font-bold text-orange-600">TOTALE CONTRIBUTI</span> +{' '}
                <span className="font-bold text-emerald-600">ADJUSTMENT</span>
              </div>
            </div>

            {/* Sub-formulas / Backward Calculation */}
            <div className="mt-4 border-t border-sky-200 pt-4">
              <h4 className="text-sm font-bold text-sky-900 mb-3">
                Sub-Formulas (Backward Calculation):
              </h4>

              <div className="space-y-2 text-xs font-mono">

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate IMPONIBILE CONTRIBUTIVO:
                  </span>
                  <div className="text-gray-900 mt-1">
                    IMPONIBILE CONTRIBUTIVO = IMPONIBILE FISCALE + TOTALE CONTRIBUTI - ADJUSTMENT
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate TOTALE CONTRIBUTI:
                  </span>
                  <div className="text-gray-900 mt-1">
                    TOTALE CONTRIBUTI = IMPONIBILE CONTRIBUTIVO + ADJUSTMENT - IMPONIBILE FISCALE
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200">
                  <span className="font-semibold text-gray-700">
                    To calculate ADJUSTMENT:
                  </span>
                  <div className="text-gray-900 mt-1">
                    ADJUSTMENT = IMPONIBILE FISCALE - IMPONIBILE CONTRIBUTIVO + TOTALE CONTRIBUTI
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Formula 11 */}
          <div className="bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-lime-900 mb-3">
              Formula 11 (RETRIBUZIONE MENSILE Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-lime-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-lime-700">RETRIBUZIONE MENSILE</span> ={' '}
                <span className="font-bold text-indigo-600">PAGA BASE CONGLOBATA</span> +{' '}
                <span className="font-bold text-orange-600">CONTINGENZA</span> +{' '}
                <span className="font-bold text-green-600">SCATTI ANZ.</span>
              </div>
            </div>
          </div>

          {/* Formula 12 */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              Formula 12 (RETRIBUZIONE GIORNALIERA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-yellow-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-yellow-700">RETRIBUZIONE GIORNALIERA</span> ={' '}
                <span className="font-bold text-indigo-600">RETRIBUZIONE MENSILE</span> /{' '}
                <span className="font-bold text-orange-600">GG. RETR.</span>
              </div>
            </div>
          </div>

          {/* Formula 13 */}
          <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-fuchsia-900 mb-3">
              Formula 13 (RETRIBUZIONE ORARIA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-fuchsia-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-fuchsia-700">RETRIBUZIONE ORARIA</span> ={' '}
                <span className="font-bold text-indigo-600">RETRIBUZIONE MENSILE</span> /{' '}
                <span className="font-bold text-gray-700">172</span>
              </div>
            </div>
          </div>

          {/* Formula 14 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">
              Formula 14 (RETRIBUZIONE ORDINARIA Calculation)
            </h3>

            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto mb-4 border border-orange-100 shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-orange-700">RETRIBUZIONE ORDINARIA</span> ={' '}
                <span className="font-bold text-indigo-600">GG. LAV.</span> ×{' '}
                <span className="font-bold text-red-600">RETRIBUZIONE GIORNALIERA</span>
              </div>
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
