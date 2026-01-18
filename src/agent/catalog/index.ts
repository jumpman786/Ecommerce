/**
 * E-Commerce Component Catalog
 *
 * This catalog defines all components available for AI-driven customization.
 * Uses the json-render createCatalog pattern with Zod schemas.
 */
import { z } from 'zod';

// Import component schemas
import { ButtonPropsSchema, ButtonDefinition } from './components/button';
import {
  TextPropsSchema,
  TextDefinition,
  ImagePropsSchema,
  ImageDefinition,
  IconPropsSchema,
  IconDefinition,
  BadgePropsSchema,
  BadgeDefinition,
  TimerPropsSchema,
  TimerDefinition,
  FlickerTextPropsSchema,
  FlickerTextDefinition,
  TrackEventSchema,
  ActionTriggerSchema,
} from './components/atomics';
import {
  ViewPropsSchema,
  ViewDefinition,
  StackPropsSchema,
  StackDefinition,
  GridPropsSchema,
  GridDefinition,
  HeaderPropsSchema,
  HeaderDefinition,
  MainBannerPropsSchema,
  MainBannerDefinition,
  ProductCardPropsSchema,
  ProductCardDefinition,
  ProductSliderPropsSchema,
  ProductSliderDefinition,
  ProductListPropsSchema,
  ProductListDefinition,
  FilterPropsSchema,
  FilterDefinition,
  SearchBarPropsSchema,
  SearchBarDefinition,
  AddToCartButtonPropsSchema,
  AddToCartButtonDefinition,
  BottomNavigationPropsSchema,
  BottomNavigationDefinition,
  MessagePropsSchema,
  MessageDefinition,
} from './components/composites';

// Re-export all schemas and types
export * from './components/button';
export * from './components/atomics';
export * from './components/composites';

/**
 * Component definition interface
 */
export interface ComponentDefinition<T extends z.ZodType = z.ZodType> {
  props: T;
  hasChildren: boolean;
  description: string;
}

/**
 * UI Element interface
 */
export interface UIElement {
  key: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  parentKey?: string | null;
  visible?: boolean | Record<string, unknown>;
  action?: z.infer<typeof ActionTriggerSchema>;
  trackEvent?: z.infer<typeof TrackEventSchema>;
}

/**
 * UI Tree interface
 */
export interface UITree {
  root: string;
  elements: Record<string, UIElement>;
}

/**
 * Component registry - maps type names to definitions
 */
export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  // Atomic components
  Text: TextDefinition,
  Image: ImageDefinition,
  Icon: IconDefinition,
  Badge: BadgeDefinition,
  Timer: TimerDefinition,
  FlickerText: FlickerTextDefinition,
  Button: ButtonDefinition,

  // Composite components
  View: ViewDefinition,
  Stack: StackDefinition,
  Grid: GridDefinition,
  Header: HeaderDefinition,
  MainBanner: MainBannerDefinition,
  ProductCard: ProductCardDefinition,
  ProductSlider: ProductSliderDefinition,
  ProductList: ProductListDefinition,
  Filter: FilterDefinition,
  SearchBar: SearchBarDefinition,
  AddToCartButton: AddToCartButtonDefinition,
  BottomNavigation: BottomNavigationDefinition,
  Message: MessageDefinition,
};

/**
 * Component schemas - maps type names to Zod schemas
 */
export const COMPONENT_SCHEMAS: Record<string, z.ZodType> = {
  Text: TextPropsSchema,
  Image: ImagePropsSchema,
  Icon: IconPropsSchema,
  Badge: BadgePropsSchema,
  Timer: TimerPropsSchema,
  FlickerText: FlickerTextPropsSchema,
  Button: ButtonPropsSchema,
  View: ViewPropsSchema,
  Stack: StackPropsSchema,
  Grid: GridPropsSchema,
  Header: HeaderPropsSchema,
  MainBanner: MainBannerPropsSchema,
  ProductCard: ProductCardPropsSchema,
  ProductSlider: ProductSliderPropsSchema,
  ProductList: ProductListPropsSchema,
  Filter: FilterPropsSchema,
  SearchBar: SearchBarPropsSchema,
  AddToCartButton: AddToCartButtonPropsSchema,
  BottomNavigation: BottomNavigationPropsSchema,
  Message: MessagePropsSchema,
};

/**
 * Components that can have children
 */
export const COMPOSITE_COMPONENTS = new Set([
  'View',
  'Stack',
  'Grid',
  'Header',
  'MainBanner',
  'ProductCard',
  'ProductSlider',
  'ProductList',
  'Filter',
  'BottomNavigation',
  'Text',
  'FlickerText',
]);

/**
 * Validate component props against schema
 */
export function validateComponentProps(
  type: string,
  props: Record<string, unknown>
): { success: boolean; error?: string } {
  const schema = COMPONENT_SCHEMAS[type];
  if (!schema) {
    return { success: false, error: `Unknown component type: ${type}` };
  }

  const result = schema.safeParse(props);
  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}

/**
 * Check if a component type can have children
 */
export function hasChildren(type: string): boolean {
  return COMPOSITE_COMPONENTS.has(type);
}

/**
 * Get component definition
 */
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return COMPONENT_DEFINITIONS[type];
}

/**
 * Get all component names
 */
export function getComponentNames(): string[] {
  return Object.keys(COMPONENT_DEFINITIONS);
}

/**
 * Generate catalog description for AI prompt
 */
export function generateCatalogPrompt(): string {
  const lines: string[] = [
    '# E-Commerce Component Catalog',
    '',
    '## Atomic Components (No Children)',
    '',
  ];

  const atomics = Object.entries(COMPONENT_DEFINITIONS)
    .filter(([_, def]) => !def.hasChildren)
    .map(([name, def]) => `- **${name}**: ${def.description}`);
  lines.push(...atomics);

  lines.push('');
  lines.push('## Composite Components (Can Have Children)');
  lines.push('');

  const composites = Object.entries(COMPONENT_DEFINITIONS)
    .filter(([_, def]) => def.hasChildren)
    .map(([name, def]) => `- **${name}**: ${def.description}`);
  lines.push(...composites);

  return lines.join('\n');
}
