import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Core
      group: any;
      mesh: any;
      
      // Geometries
      boxGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;
      circleGeometry: any;
      ringGeometry: any;
      torusGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;

      // Lights
      ambientLight: any;
      directionalLight: any;

      // Catch-all
      [elemName: string]: any;
    }
  }
}

export type Language = 'en' | 'de' | 'sk';

export type StepName = 'exterior' | 'interior' | 'extras';

export type CapsuleVariant = 'nano' | 'standard' | 'max' | 'loft';

export interface ConfigState {
  // Model Variant
  capsuleVariant: CapsuleVariant;

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
  basePrice: number; // Base price is now derived from variant
  options: {
    [key in keyof ConfigState]?: {
      [value: string]: number; // For enums/strings
    } | number; // For booleans
  };
}

export const STEPS: { id: number; name: StepName; label: string; description: string }[] = [
  { id: 0, name: 'exterior', label: 'Exterior', description: 'Model & Shell' },
  { id: 1, name: 'interior', label: 'Interior', description: 'Layout & Furniture' },
  { id: 2, name: 'extras', label: 'Extras', description: 'Utilities' },
];