/**
 * Component Registry
 *
 * Maps catalog component types to React Native components.
 * Provides wrappers that add analytics and action handling.
 */
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { UIElement } from '../catalog';

// Import original components from the app
// These will be wrapped with analytics and action support

/**
 * Component render props passed by the renderer
 */
export interface ComponentRenderProps {
  element: UIElement;
  children?: React.ReactNode;
  onAction?: (action: { name: string; params?: Record<string, unknown> }) => void;
}

/**
 * Component registry type
 */
export type ComponentRegistry = Record<
  string,
  React.ComponentType<ComponentRenderProps>
>;

/**
 * Create a basic wrapper component
 */
function createBasicWrapper(
  Component: React.ComponentType<any>,
  mapProps?: (props: Record<string, unknown>) => Record<string, unknown>
): React.ComponentType<ComponentRenderProps> {
  return function WrappedComponent({ element, children, onAction }: ComponentRenderProps) {
    const props = mapProps ? mapProps(element.props) : element.props;

    // Handle press events with action
    const handlePress = () => {
      if (element.action && onAction) {
        onAction(element.action);
      }
      // Also call original onPress if exists
      if (typeof props.onPress === 'function') {
        props.onPress();
      }
    };

    return React.createElement(
      Component,
      { ...props, onPress: handlePress },
      children
    );
  };
}

/**
 * Default registry with basic React Native components
 * This will be extended with actual app components
 */
export const defaultRegistry: ComponentRegistry = {
  // Basic layout
  View: createBasicWrapper(View, (props) => ({
    style: {
      flex: props.flex,
      flexDirection: props.flexDirection,
      justifyContent: props.justifyContent,
      alignItems: props.alignItems,
      padding: props.padding,
      paddingHorizontal: props.paddingHorizontal,
      paddingVertical: props.paddingVertical,
      margin: props.margin,
      width: props.width,
      height: props.height,
      backgroundColor: props.backgroundColor,
      borderRadius: props.borderRadius,
      borderWidth: props.borderWidth,
      borderColor: props.borderColor,
      gap: props.gap,
    },
  })),

  // Basic text
  Text: createBasicWrapper(Text, (props) => ({
    style: {
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      color: props.color,
      letterSpacing: props.letterSpacing,
      textAlign: props.textAlign,
      textDecorationLine: props.textDecoration,
    },
    numberOfLines: props.numberOfLines,
    children: props.content,
  })),

  // Basic image
  Image: createBasicWrapper(Image, (props) => ({
    source: typeof props.source === 'string' ? { uri: props.source } : props.source,
    style: {
      width: props.width,
      height: props.height,
      borderRadius: props.borderRadius,
    },
    resizeMode: props.contentFit,
  })),

  // ScrollView
  ScrollView: createBasicWrapper(ScrollView),

  // Touchable
  Touchable: createBasicWrapper(TouchableOpacity),
};

/**
 * Merge registries
 */
export function mergeRegistries(
  ...registries: ComponentRegistry[]
): ComponentRegistry {
  return Object.assign({}, ...registries);
}

/**
 * Get component from registry
 */
export function getComponent(
  registry: ComponentRegistry,
  type: string
): React.ComponentType<ComponentRenderProps> | undefined {
  return registry[type];
}

export default defaultRegistry;
