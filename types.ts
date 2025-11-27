import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export type Language = 'en' | 'de' | 'sk';

export type StepName = 'exterior' | 'interior' | 'extras';

export interface ConfigState {
  // Exterior
  wallColor: string;
  windowType: 'standard' | 'panoramic';
  
  // Interior
  hasKitchen: boolean;
  tableType: 'none' | 'small' | 'large';
  floorMaterial: 'wood' | 'tile' | 'concrete';

  // Extras
  solarPanels: boolean;
  acUnit: boolean;
}

export interface PricingRule {
  basePrice: number;
  options: {
    [key in keyof ConfigState]?: {
      [value: string]: number; // For enums/strings
    } | number; // For booleans
  };
}

export const STEPS: { id: number; name: StepName; label: string; description: string }[] = [
  { id: 0, name: 'exterior', label: 'Exterior', description: 'Design the shell and finish.' },
  { id: 1, name: 'interior', label: 'Interior', description: 'Configure layout and furniture.' },
  { id: 2, name: 'extras', label: 'Extras', description: 'Add utilities and features.' },
];