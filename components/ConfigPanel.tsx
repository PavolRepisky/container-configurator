import React from 'react';
import { ConfigState, StepName } from '../types';
import { COLORS } from '../constants';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface ConfigPanelProps {
  step: StepName;
  config: ConfigState;
  updateConfig: (key: keyof ConfigState, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalPrice: number;
  t: any;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  step,
  config,
  updateConfig,
  nextStep,
  prevStep,
  isFirstStep,
  isLastStep,
  totalPrice,
  t
}) => {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const renderExteriorControls = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.options.wallColor}</label>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateConfig('wallColor', c.value)}
              className={`h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                config.wallColor === c.value ? 'border-blue-600 scale-105 shadow-md' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.value }}
              title={t.colors[c.label] || c.label}
            >
               {config.wallColor === c.value && <Check className="text-white drop-shadow-md" size={18} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.options.windowStyle}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateConfig('windowType', 'standard')}
            className={`p-3 text-sm rounded-lg border-2 transition-all ${
              config.windowType === 'standard' 
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {t.options.standard}
          </button>
          <button
            onClick={() => updateConfig('windowType', 'panoramic')}
             className={`p-3 text-sm rounded-lg border-2 transition-all ${
              config.windowType === 'panoramic' 
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {t.options.panoramic} (+$3,500)
          </button>
        </div>
      </div>
    </div>
  );

  const renderInteriorControls = () => (
    <div className="space-y-6 animate-fadeIn">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.options.floorMaterial}</label>
         <select 
            value={config.floorMaterial}
            onChange={(e) => updateConfig('floorMaterial', e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
         >
            <option value="concrete">{t.options.concrete} ({t.options.included})</option>
            <option value="wood">{t.options.wood} (+$1,200)</option>
            <option value="tile">{t.options.tile} (+$1,500)</option>
         </select>
       </div>

       <div>
         <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="font-medium text-gray-700">{t.options.kitchen} (+$5,000)</span>
            <input 
                type="checkbox" 
                checked={config.hasKitchen} 
                onChange={(e) => updateConfig('hasKitchen', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
         </label>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.options.dining}</label>
        <div className="space-y-2">
            {[
                { val: 'none', label: t.options.noTable, price: 0 },
                { val: 'small', label: t.options.cafeTable, price: 400 },
                { val: 'large', label: t.options.familyTable, price: 800 }
            ].map((opt) => (
                <button
                    key={opt.val}
                    onClick={() => updateConfig('tableType', opt.val)}
                    className={`w-full text-left p-3 rounded-lg border-2 flex justify-between transition-all ${
                        config.tableType === opt.val 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <span className={`text-sm ${config.tableType === opt.val ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>{opt.label}</span>
                    {opt.price > 0 && <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">+${opt.price}</span>}
                </button>
            ))}
        </div>
       </div>
    </div>
  );

  const renderExtrasControls = () => (
    <div className="space-y-4 animate-fadeIn">
        <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${config.solarPanels ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex flex-col">
                <span className="font-medium text-gray-800">{t.options.solar}</span>
                <span className="text-xs text-gray-500">{t.options.solarDesc}</span>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-sm font-semibold text-gray-600">+$4,500</span>
                 <input 
                    type="checkbox" 
                    checked={config.solarPanels} 
                    onChange={(e) => updateConfig('solarPanels', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
            </div>
         </label>

         <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${config.acUnit ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex flex-col">
                <span className="font-medium text-gray-800">{t.options.hvac}</span>
                <span className="text-xs text-gray-500">{t.options.hvacDesc}</span>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-sm font-semibold text-gray-600">+$1,200</span>
                 <input 
                    type="checkbox" 
                    checked={config.acUnit} 
                    onChange={(e) => updateConfig('acUnit', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
            </div>
         </label>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-l-2xl overflow-hidden border-l border-gray-100">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
         <h2 className="text-xl font-bold text-gray-900">{t.ui.customize}</h2>
         <p className="text-sm text-gray-500 mt-1 capitalize">{t.steps[step]} {t.ui.settings}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 'exterior' && renderExteriorControls()}
        {step === 'interior' && renderInteriorControls()}
        {step === 'extras' && renderExtrasControls()}
      </div>

      {/* Footer / Price / Navigation */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
        <div className="flex justify-between items-end">
            <span className="text-gray-500 text-sm">{t.ui.total}</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
        </div>
        
        <div className="flex gap-3">
             <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    isFirstStep 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
             >
                <ChevronLeft size={18} />
                {t.ui.back}
             </button>
             <button
                onClick={nextStep}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-white transition-all shadow-lg hover:shadow-xl ${
                    isLastStep
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
             >
                {isLastStep ? t.ui.finish : t.ui.next}
                {!isLastStep && <ChevronRight size={18} />}
             </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;