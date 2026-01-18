/**
 * UI Tree Context - Shares the current UI tree state with all components
 * Components can read their props from this tree to enable AI agent modifications
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UITree, UIElement } from './catalog';
import { initialHomeTree } from './initialTree';

interface UITreeContextValue {
  tree: UITree;
  renderVersion: number;
  setTree: (tree: UITree) => void;
  getElement: (key: string) => UIElement | undefined;
  updateElement: (key: string, props: Record<string, any>) => void;
  applyPatch: (patch: { op: string; path: string; value?: any }) => void;
}

const UITreeContext = createContext<UITreeContextValue>({
  tree: initialHomeTree,
  renderVersion: 0,
  setTree: () => {},
  getElement: () => undefined,
  updateElement: () => {},
  applyPatch: () => {},
});

interface UITreeProviderProps {
  children: ReactNode;
}

export function UITreeProvider({ children }: UITreeProviderProps) {
  const [tree, setTreeState] = useState<UITree>(initialHomeTree);
  const [renderVersion, setRenderVersion] = useState(0);

  const setTree = useCallback((newTree: UITree) => {
    console.log('🌳 UI Tree updated, elements:', Object.keys(newTree.elements).length);
    setTreeState(newTree);
  }, []);

  const getElement = useCallback((key: string): UIElement | undefined => {
    return tree.elements[key];
  }, [tree]);

  const updateElement = useCallback((key: string, props: Record<string, any>) => {
    setTreeState(prev => {
      const element = prev.elements[key];
      if (!element) return prev;
      
      console.log('🔄 Updating element:', key, 'with props:', props);
      
      return {
        ...prev,
        elements: {
          ...prev.elements,
          [key]: {
            ...element,
            props: { ...element.props, ...props },
          },
        },
      };
    });
  }, []);

  const applyPatch = useCallback((patch: { op: string; path: string; value?: any }) => {
    console.log('📦 Applying patch:', patch);
    
    // Parse path like "/elements/main-banner/props"
    const pathParts = patch.path.split('/').filter(Boolean);
    
    setTreeState(prev => {
      if (pathParts[0] !== 'elements' || pathParts.length < 2) {
        return prev;
      }
      
      const elementKey = pathParts[1];
      const property = pathParts[2];
      const newElements = { ...prev.elements };
      
      switch (patch.op) {
        case 'replace':
          if (!newElements[elementKey]) {
            console.warn('Element not found for replace:', elementKey);
            return prev;
          }
          
          if (property === 'props') {
            // Deep merge props - especially important for style objects
            console.log('🔄 Replacing props for:', elementKey, 'with:', patch.value);
            const currentElement = newElements[elementKey];
            const currentProps = currentElement.props || {};
            const newProps = patch.value || {};
            
            // Deep merge style objects
            let mergedStyle = currentProps.style;
            if (newProps.style) {
              mergedStyle = { ...currentProps.style, ...newProps.style };
            }
            
            // Deep merge textStyle objects
            let mergedTextStyle = currentProps.textStyle;
            if (newProps.textStyle) {
              mergedTextStyle = { ...currentProps.textStyle, ...newProps.textStyle };
            }
            
            // Merge all props, with deep-merged style objects
            const mergedProps = {
              ...currentProps,
              ...newProps,
              ...(mergedStyle ? { style: mergedStyle } : {}),
              ...(mergedTextStyle ? { textStyle: mergedTextStyle } : {}),
            };
            
            newElements[elementKey] = { 
              ...currentElement,
              props: mergedProps
            };
            console.log('✅ Updated element:', newElements[elementKey]);
          } else if (property === 'children') {
            // Update children array (for reorder/move)
            console.log('🔄 Updating children for:', elementKey, 'to:', patch.value);
            newElements[elementKey] = { 
              ...newElements[elementKey], 
              children: patch.value 
            };
          } else if (property === 'parentKey') {
            // Update parent reference
            console.log('🔄 Updating parentKey for:', elementKey, 'to:', patch.value);
            newElements[elementKey] = { 
              ...newElements[elementKey], 
              parentKey: patch.value 
            };
          }
          break;
          
        case 'add':
          // Add new element (path is /elements/{key}, value is full element)
          console.log('➕ Adding new element:', elementKey);
          const newElement = patch.value;
          newElements[elementKey] = newElement;
          
          // If element has a parentKey, add it to parent's children array
          if (newElement.parentKey) {
            const parentKey = newElement.parentKey;
            const parent = newElements[parentKey];
            if (parent) {
              const parentChildren = parent.children || [];
              // Only add if not already in children
              if (!parentChildren.includes(elementKey)) {
                console.log(`🔗 Adding ${elementKey} to parent ${parentKey}'s children`);
                newElements[parentKey] = {
                  ...parent,
                  children: [...parentChildren, elementKey]
                };
              }
            } else {
              console.warn(`⚠️ Parent ${parentKey} not found for new element ${elementKey}`);
            }
          } else {
            // If no parentKey, try to infer parent from element key/type
            // For example, if it's a subtitle and main-banner exists, add it there
            if (elementKey.includes('subtitle') || elementKey.includes('title')) {
              const mainBanner = newElements['main-banner'];
              if (mainBanner) {
                console.log(`🔗 Auto-adding ${elementKey} to main-banner (inferred parent)`);
                const bannerChildren = mainBanner.children || [];
                if (!bannerChildren.includes(elementKey)) {
                  newElements['main-banner'] = {
                    ...mainBanner,
                    children: [...bannerChildren, elementKey]
                  };
                }
              }
            }
          }
          break;
          
        case 'remove':
          // Remove element
          console.log('➖ Removing element:', elementKey);
          delete newElements[elementKey];
          break;
          
        default:
          console.warn('Unknown patch operation:', patch.op);
          return prev;
      }
      
      return { ...prev, elements: newElements };
    });
    
    // Increment render version after state update to force re-renders
    setRenderVersion(v => v + 1);
  }, []);

  return (
    <UITreeContext.Provider value={{ tree, renderVersion, setTree, getElement, updateElement, applyPatch }}>
      {children}
    </UITreeContext.Provider>
  );
}

export function useUITree() {
  return useContext(UITreeContext);
}

/**
 * Hook to get a specific element's props from the UI tree
 * Falls back to default props if element not found
 */
export function useUIElement<T extends Record<string, any>>(
  key: string,
  defaultProps: T
): T {
  const { getElement } = useUITree();
  const element = getElement(key);
  
  if (element) {
    return { ...defaultProps, ...element.props } as T;
  }
  
  return defaultProps;
}

export default UITreeContext;

