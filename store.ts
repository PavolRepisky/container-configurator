import { create } from 'zustand';
import { ConfigState, Language, StepName, STEPS } from './types';
import { INITIAL_CONFIG, PRICING } from './constants';

interface ConfigStoreState {
  // State
  config: ConfigState;
  currentStepIndex: number;
  isFinished: boolean;
  language: Language;

  // Actions
  updateConfig: (key: keyof ConfigState, value: any) => void;
  setLanguage: (lang: Language) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetFinished: () => void;
  
  // Getters
  getCurrentStep: () => { name: StepName; label: string };
  getTotalPrice: () => number;
}

export const useConfigStore = create<ConfigStoreState>((set, get) => ({
  config: INITIAL_CONFIG,
  currentStepIndex: 0,
  isFinished: false,
  language: 'en',

  updateConfig: (key, value) => 
    set((state) => ({
      config: { ...state.config, [key]: value }
    })),

  setLanguage: (language) => set({ language }),

  nextStep: () => 
    set((state) => {
      if (state.currentStepIndex < STEPS.length - 1) {
        return { currentStepIndex: state.currentStepIndex + 1 };
      }
      return { isFinished: true };
    }),

  prevStep: () => 
    set((state) => {
      if (state.isFinished) {
        return { isFinished: false };
      }
      if (state.currentStepIndex > 0) {
        return { currentStepIndex: state.currentStepIndex - 1 };
      }
      return {};
    }),

  resetFinished: () => set({ isFinished: false }),

  getCurrentStep: () => {
    const { currentStepIndex } = get();
    const step = STEPS[currentStepIndex];
    return { name: step.name, label: step.label };
  },

  getTotalPrice: () => {
    const { config } = get();
    
    // Base Price is determined by the variant
    const variantCost = (PRICING.options.capsuleVariant as Record<string, number>)?.[config.capsuleVariant] || 0;
    
    // Calculate enum/string based costs
    const colorCost = (PRICING.options.wallColor as Record<string, number>)?.[config.wallColor] || 0;
    const windowCost = (PRICING.options.windowType as Record<string, number>)?.[config.windowType] || 0;
    const tableCost = (PRICING.options.tableType as Record<string, number>)?.[config.tableType] || 0;
    const floorCost = (PRICING.options.floorMaterial as Record<string, number>)?.[config.floorMaterial] || 0;

    // Calculate boolean costs
    const kitchenCost = config.hasKitchen ? (PRICING.options.hasKitchen as number) : 0;
    const solarCost = config.solarPanels ? (PRICING.options.solarPanels as number) : 0;
    const acCost = config.acUnit ? (PRICING.options.acUnit as number) : 0;

    return variantCost + colorCost + windowCost + tableCost + floorCost + kitchenCost + solarCost + acCost;
  }
}));