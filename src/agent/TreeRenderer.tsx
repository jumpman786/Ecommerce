/**
 * TreeRenderer - Recursively renders components based on UI tree structure
 * 
 * This component enables dynamic layout changes by rendering children
 * in the order specified by the tree, allowing the AI agent to:
 * - Reorder components via reorder_components
 * - Add new components via add_component
 * - Remove components via remove_component
 * - Move components via move_component
 */
import React from 'react';
import { View, Text } from 'react-native';
import { useUITree } from './UITreeContext';
import useRegister from '../register/hooks/useRegister';

interface TreeRendererProps {
  elementKey: string;
  fallback?: React.ReactNode;
}

/**
 * Renders a single element and its children recursively from the UI tree
 * 
 * Handles:
 * - visible prop: Don't render if visible === false
 * - All props passed directly from tree to component
 * - Recursive children rendering from element.children array
 */
export function TreeRenderer({ elementKey, fallback = null }: TreeRendererProps): React.ReactElement | null {
  const { tree, renderVersion } = useUITree();
  const register = useRegister();
  
  const element = tree.elements[elementKey];
  
  if (!element) {
    console.warn('TreeRenderer: Element not found:', elementKey);
    return fallback as React.ReactElement | null;
  }
  
  // Handle visible prop - don't render if explicitly false
  if (element.visible === false || element.props?.visible === false) {
    return null;
  }
  
  // Get the React component for this element type
  const Component = register.getComponent(element.type);
  
  if (!Component) {
    console.warn('TreeRenderer: Component not registered:', element.type);
    // Render a placeholder for unknown components
    return (
      <View style={{ padding: 10, backgroundColor: '#ffeeee', borderRadius: 4 }}>
        <Text style={{ color: '#cc0000' }}>Unknown: {element.type}</Text>
      </View>
    );
  }
  
  // Create a fresh props object to ensure React detects changes
  // This is important for components that might be memoized
  const elementProps = element.props || {};
  
  // Render children recursively if the element has children
  // Support both tree children (element.children array) and React children (props.children)
  // Key includes renderVersion to force re-render when any element's props change
  const treeChildren = element.children?.length ? (
    element.children.map(childKey => (
      <TreeRenderer key={`${childKey}-v${renderVersion}`} elementKey={childKey} />
    ))
  ) : null;
  
  // Extract visible and children from props (don't pass them directly to components)
  // Also filter out any other props that might contain string children
  const { 
    visible, 
    children: propsChildren, 
    'v:children': vChildren, // Filter out json-render style children prop
    ...propsWithoutVisible 
  } = { ...elementProps };
  
  // Remove any remaining children-like props that are strings (React Native doesn't allow text nodes)
  const cleanedProps = Object.fromEntries(
    Object.entries(propsWithoutVisible).filter(([key, value]) => {
      // Don't pass children as a prop if it's a string
      if (key === 'children' && typeof value === 'string') {
        return false;
      }
      // Don't pass empty strings or single characters that look like text nodes
      if (typeof value === 'string' && (value.trim() === '' || value === '.')) {
        return false;
      }
      return true;
    })
  );
  
  
  // Determine final children - prefer tree children, then props children
  // Filter out string children (React Native doesn't allow text nodes as direct children of View)
  let finalChildren = treeChildren;
  if (!finalChildren && propsChildren !== undefined && propsChildren !== null) {
    // If propsChildren is a string, wrap it in Text component (but filter out empty/period strings)
    if (typeof propsChildren === 'string') {
      const trimmed = propsChildren.trim();
      // Only render if it's a meaningful string (not empty, not just a period)
      finalChildren = trimmed && trimmed !== '.' && trimmed.length > 0 ? <Text>{trimmed}</Text> : null;
    } else if (Array.isArray(propsChildren)) {
      // Filter and wrap any strings in the array, filter out empty strings and periods
      const validChildren = propsChildren
        .filter(child => {
          if (child === null || child === undefined) return false;
          if (typeof child === 'string') {
            const trimmed = child.trim();
            return trimmed !== '' && trimmed !== '.' && trimmed.length > 0;
          }
          return true;
        })
        .map((child, idx) => 
          typeof child === 'string' ? <Text key={idx}>{child}</Text> : child
        );
      finalChildren = validChildren.length > 0 ? validChildren : null;
    } else {
      // For other types (React elements, etc.), pass through
      finalChildren = propsChildren;
    }
  }
  
  // Ensure finalChildren is never an empty string or period
  if (finalChildren === '' || finalChildren === '.') {
    finalChildren = null;
  }
  
  // Use renderVersion in key to force re-render when tree updates
  // This ensures React detects changes even if component is memoized
  const keyValue = `${elementKey}-v${renderVersion}`;
  
  // Render the component with all props from tree
  // Use key to force re-render when critical props change
  return (
    <Component key={keyValue} {...cleanedProps}>
      {finalChildren}
    </Component>
  );
}

/**
 * Renders the entire tree starting from a root element
 */
export function TreeRoot({ rootKey }: { rootKey?: string }): React.ReactElement | null {
  const { tree } = useUITree();
  const key = rootKey || tree.root;
  
  return <TreeRenderer elementKey={key} />;
}

export default TreeRenderer;

