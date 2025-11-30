import React from 'react';
import Experience from './components/Experience';
import ConfigPanel from './components/ConfigPanel';
import { STEPS, Language } from './types';
import { PRICING, COLORS } from './constants';
import { Boxes, Download, CheckCircle, Globe } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TRANSLATIONS } from './translations';
import { useConfigStore } from './store';

const App: React.FC = () => {
  const currentStepIndex = useConfigStore((state) => state.currentStepIndex);
  const isFinished = useConfigStore((state) => state.isFinished);
  const language = useConfigStore((state) => state.language);
  const setLanguage = useConfigStore((state) => state.setLanguage);
  const prevStep = useConfigStore((state) => state.prevStep);
  const getTotalPrice = useConfigStore((state) => state.getTotalPrice);
  const config = useConfigStore((state) => state.config);
  
  const t = TRANSLATIONS[language];
  const totalPrice = getTotalPrice();

  const handleExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Helper to format currency
    const fmt = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(t.ui.quoteTitle, 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(`${t.ui.generatedOn} ${new Date().toLocaleDateString()}`, 20, yPos);
    
    yPos += 20;

    // --- Line Items Helper ---
    const addLineItem = (label: string, value: string, price: number) => {
        doc.setFontSize(12);
        doc.setTextColor(55, 65, 81); // Gray-700
        doc.text(label, 20, yPos);
        
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray-500
        // Clean special chars if necessary, but standard font might struggle with some SK chars
        doc.text(value, 80, yPos);
        
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39); // Gray-900
        doc.text(fmt(price), pageWidth - 20, yPos, { align: 'right' });
        
        yPos += 10;
    };

    // --- Content ---
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);

    // Base Model (Variant)
    const variantCost = (PRICING.options.capsuleVariant as Record<string, number>)?.[config.capsuleVariant] || 0;
    addLineItem(t.options.modelVariant, t.options[config.capsuleVariant], variantCost);

    // Exterior
    const colorCost = (PRICING.options.wallColor as Record<string, number>)?.[config.wallColor] || 0;
    const selectedColor = COLORS.find(c => c.value === config.wallColor);
    addLineItem(t.options.wallColor, selectedColor ? (t.colors[selectedColor.label] || selectedColor.label) : config.wallColor, colorCost);

    const windowCost = (PRICING.options.windowType as Record<string, number>)?.[config.windowType] || 0;
    addLineItem(t.options.windowStyle, config.windowType === 'panoramic' ? t.options.panoramicView : t.options.standardView, windowCost);

    // Interior
    const floorCost = (PRICING.options.floorMaterial as Record<string, number>)?.[config.floorMaterial] || 0;
    const floorLabel = config.floorMaterial === 'wood' ? t.options.wood : config.floorMaterial === 'tile' ? t.options.tile : t.options.concrete;
    addLineItem(t.options.floorMaterial, floorLabel, floorCost);

    const kitchenCost = config.hasKitchen ? (PRICING.options.hasKitchen as number) : 0;
    addLineItem(t.options.kitchen, config.hasKitchen ? t.options.included : t.options.none, kitchenCost);

    const tableCost = (PRICING.options.tableType as Record<string, number>)?.[config.tableType] || 0;
    const tableLabel = config.tableType === 'small' ? t.options.cafeTable : config.tableType === 'large' ? t.options.familyTable : t.options.none;
    addLineItem(t.options.dining, tableLabel, tableCost);

    // Extras
    const solarCost = config.solarPanels ? (PRICING.options.solarPanels as number) : 0;
    if (config.solarPanels) addLineItem(t.options.solar, t.options.roofArray, solarCost);

    const acCost = config.acUnit ? (PRICING.options.acUnit as number) : 0;
    if (config.acUnit) addLineItem(t.options.hvac, t.options.extModule, acCost);

    // --- Footer / Total ---
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t.ui.total.toUpperCase(), 20, yPos);
    doc.text(fmt(totalPrice), pageWidth - 20, yPos, { align: 'right' });

    // Save
    doc.save('capsule-mod-quote.pdf');
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col md:flex-row">
      
      {/* 3D Canvas Area */}
      <div className="flex-1 relative h-[50vh] md:h-full order-1 md:order-1">
        <Experience />
        
        {/* Top Overlay Branding */}
        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center gap-2 pointer-events-none">
            <Boxes className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">Capsule<span className="text-blue-600">Mod</span></span>
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2 bg-white/90 backdrop-blur p-1 rounded-lg shadow-sm">
             <Globe size={16} className="ml-2 text-gray-500" />
             <div className="flex gap-1">
                {(['en', 'de', 'sk'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            language === lang 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
             </div>
        </div>

        {/* Step Indicator (Mobile/Desktop) */}
        {!isFinished && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 hidden md:flex gap-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm">
            {STEPS.map((step, idx) => (
                <div 
                    key={step.id}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                        idx === currentStepIndex 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500'
                    }`}
                >
                    {t.steps[step.name]}
                </div>
            ))}
            </div>
        )}
      </div>

      {/* UI Sidebar Area */}
      <div className="relative z-20 w-full md:w-[400px] h-[50vh] md:h-full order-2 md:order-2">
        {isFinished ? (
            <div className="flex flex-col h-full bg-white shadow-xl md:rounded-l-2xl p-8 items-center justify-center text-center animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.ui.readyTitle}</h2>
                <p className="text-gray-500 mb-8">{t.ui.readyText}</p>
                
                <div className="text-4xl font-bold text-gray-900 mb-8">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalPrice)}
                </div>

                <div className="w-full space-y-3">
                    <button 
                        onClick={handleExport}
                        className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        {t.ui.download}
                    </button>
                    <button 
                        onClick={prevStep}
                        className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t.ui.edit}
                    </button>
                </div>
            </div>
        ) : (
            <ConfigPanel />
        )}
      </div>
    </div>
  );
};

export default App;