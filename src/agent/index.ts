/**
 * AI Agent exports
 *
 * Main entry point for the AI customization agent system.
 */

// Catalog exports
export * from './catalog';

// UI Tree exports
export { UITreeProvider, useUITree, useUIElement } from './UITreeContext';

// Tree Renderer exports
export { TreeRenderer, TreeRoot } from './TreeRenderer';

// Hook exports
export { useAgentCustomization } from './hooks/useAgentCustomization';
export type {
  TodoItem,
  PatchOperation,
  CustomizeEvent,
  UseAgentCustomizationOptions,
  UseAgentCustomizationResult,
} from './hooks/useAgentCustomization';

// Registry exports
export * from './registry';
