import { ConfigState, PricingRule } from './types';

export const INITIAL_CONFIG: ConfigState = {
  wallColor: '#374151', // Dark Gray
  windowType: 'standard',
  hasKitchen: true,
  tableType: 'small',
  floorMaterial: 'wood',
  solarPanels: false,
  acUnit: false,
};

export const PRICING: PricingRule = {
  basePrice: 25000,
  options: {
    wallColor: {
      '#374151': 0,
      '#9CA3AF': 500, // Silver
      '#B91C1C': 800, // Red
      '#1D4ED8': 800, // Blue
      '#047857': 800, // Green
      '#FCD34D': 1000, // Gold/Yellow
    },
    windowType: {
      standard: 0,
      panoramic: 3500,
    },
    hasKitchen: 5000, // Boolean cost
    tableType: {
      none: 0,
      small: 400,
      large: 800,
    },
    floorMaterial: {
      concrete: 0,
      wood: 1200,
      tile: 1500,
    },
    solarPanels: 4500,
    acUnit: 1200,
  },
};

export const COLORS = [
  { label: 'Graphite', value: '#374151' },
  { label: 'Silver', value: '#9CA3AF' },
  { label: 'Crimson', value: '#B91C1C' },
  { label: 'Ocean', value: '#1D4ED8' },
  { label: 'Forest', value: '#047857' },
  { label: 'Amber', value: '#FCD34D' },
];
