import React from 'react';
import { View, Text } from 'react-native';
import mainBanner from "../assets/images/main-banner.jpg"
import { ImageBackground } from 'react-native';
import Button from './Button'
import { Dimensions } from 'react-native';
import { useUITree } from '../agent/UITreeContext';
const { width } = Dimensions.get('window');
/**
 * MainBanner - Accepts props from tree for AI customization
 * 
 * Props:
 * - title: Banner title text (default: "JUST FOR YOU")
 * - subtitle: Subtitle text (optional)
 * - ctaText: Call-to-action button text (default: "SHOP ALL")
 * - imageUrl: Image source (default: local banner image)
 * - backgroundColor: Background color if no image
 * - textColor: Text color
 * - height: Banner height (default: 300)
 * - overlay: Overlay color for image
 */
const MainBanner = ({
  title = 'JUST FOR YOU',
  subtitle,
  ctaText = 'SHOP ALL',
  imageUrl,
  backgroundColor,
  textColor,
  color, // Alias for textColor (AI might send "color" instead of "textColor")
  titleColor, // Specific color for title (overrides textColor for title)
  height = 300,
  overlay,
  children, // Tree children components
  buttonAlignment, // Alignment for button wrapper (from props or button's style)
  ...props
}) => {
  // Get button element from tree to check its style and props
  // Subscribe to tree changes by accessing tree directly (not just getElement)
  const { tree, renderVersion } = useUITree();
  // Directly access tree.elements to ensure React detects changes
  const mainBannerElement = tree.elements['main-banner'];
  const buttonElement = tree.elements['main-banner-cta-button'];
  const buttonProps = buttonElement?.props || {};
  const buttonStyle = buttonProps.style || {};
  
  // Support multiple ways to specify alignment:
  // 1. Direct prop: alignSelf, alignment, position (right/left/center)
  // 2. Nested in style: style.alignSelf
  // Map "right" -> "flex-end", "left" -> "flex-start", "center" -> "center"
  const mapAlignment = (align) => {
    if (!align) return null;
    const alignMap = {
      'right': 'flex-end',
      'left': 'flex-start',
      'center': 'center',
      'start': 'flex-start',
      'end': 'flex-end',
    };
    return alignMap[align.toLowerCase?.()] || align;
  };
  
  const buttonAlignSelf = mapAlignment(buttonProps.alignSelf) ||
                         mapAlignment(buttonProps.alignment) ||
                         mapAlignment(buttonProps.position) ||
                         mapAlignment(buttonStyle.alignSelf) ||
                         buttonAlignment ||
                         "flex-start";
  
  
  // Get children order from tree - this ensures we respect reordering
  const childrenOrder = mainBannerElement?.children || [];
  
  // Force re-render when tree changes by referencing renderVersion and tree
  // This ensures MainBanner updates when button props change or children are reordered
  const _forceRerender = renderVersion; // Reference to trigger re-render
  const _treeRef = tree.elements; // Direct reference to elements for change detection
  const _childrenRef = childrenOrder; // Reference to children array for reordering detection
  // Use imageUrl if provided, otherwise fall back to local image
  // Handle "local:" prefix - these are references to local assets, use default image
  // Handle URLs that start with http/https - these are remote images
  const getImageSource = () => {
    if (!imageUrl) return mainBanner;
    if (typeof imageUrl === 'string') {
      // "local:" prefix means use the local asset
      if (imageUrl.startsWith('local:')) return mainBanner;
      // Base64 data URLs from AI image generation
      if (imageUrl.startsWith('data:')) {
        return { uri: imageUrl };
      }
      // Remote URLs
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return { uri: imageUrl };
      }
      // Invalid URL, fall back to local
      return mainBanner;
    }
    // Already an object (require statement)
    return imageUrl;
  };
  const imageSource = getImageSource();

  // Map color to textColor if provided (AI might send "color" prop)
  const effectiveTextColor = textColor || color || 'black';
  
  // Use titleColor if provided, otherwise fall back to textColor
  const titleTextColor = titleColor || effectiveTextColor;

  // Determine overlay color - backgroundColor takes precedence if explicitly provided
  // If backgroundColor is set, use it instead of overlay
  const overlayColor = backgroundColor !== undefined ? backgroundColor : overlay;
  const hasOverlay = overlayColor && imageSource;
  
  return (
    <ImageBackground
      source={imageSource}
      style={{
        position: "relative",
        width: width,
        height: height,
        justifyContent: "flex-end",
        padding: 20,
        paddingBottom: 40,
        backgroundColor: backgroundColor, // Fallback if no image
        ...props.style,
      }}
      resizeMode="cover"
    >
      {/* Overlay if image exists - backgroundColor takes precedence over overlay prop */}
      {hasOverlay && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayColor,
          // If backgroundColor is explicitly set, use higher opacity to make it visible
          // Otherwise use the original overlay opacity
          opacity: backgroundColor !== undefined ? 0.8 : 1,
        }} />
      )}
      
      {/* Render title and subtitle (these are props, not children) */}
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: titleTextColor,
        letterSpacing: 1,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 5,
        marginBottom: 7,
      }}>{title}</Text>

      {subtitle && (
        <Text style={{
          fontSize: 14,
          color: effectiveTextColor,
          letterSpacing: 0.5,
          backgroundColor: 'white',
          alignSelf: 'flex-start',
          padding: 5,
          marginBottom: 7,
        }}>{subtitle}</Text>
      )}

      {/* Render tree children - allow free positioning */}
      {/* Children can use absolute positioning, margins, transforms, etc. */}
      {children && (() => {
        // Read button props fresh from tree for key calculation
        const currentButtonProps = tree.elements['main-banner-cta-button']?.props || {};
        const currentStyle = currentButtonProps.style || {};
        const styleKey = JSON.stringify(currentStyle).slice(0, 50); // Use style in key for re-render
        
        return (
          <View 
            key={`children-wrapper-${renderVersion}-${childrenOrder.join('-')}-${styleKey}-${buttonAlignSelf}`}
            style={{
              // Allow children to use absolute positioning within the banner
              // If child has position: 'absolute', it will position relative to banner
              // Otherwise use flex positioning based on alignItems
              width: '100%',
              // Use alignItems to position children horizontally
              alignItems: currentStyle.position === 'absolute' ? undefined : buttonAlignSelf,
              paddingBottom: currentStyle.position === 'absolute' ? 0 : 20,
            }}
          >
          {/* Render children as-is - TreeRenderer handles props, children handle their own positioning */}
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            
            // Get the child's element from tree to apply its style
            const childKey = child.key?.replace(/-v\d+$/, '') || ''; // Remove version suffix
            const childElement = tree.elements[childKey] || tree.elements['main-banner-cta-button'];
            const childStyle = childElement?.props?.style || {};
            
            // Clone child with style from tree (allows free positioning)
            return React.cloneElement(child, {
              style: childStyle,
              // Forward fontSize/padding if MainBanner has them
              ...(props.fontSize ? { fontSize: props.fontSize } : {}),
              ...(props.padding || props.buttonPadding ? { padding: props.padding || props.buttonPadding } : {}),
            });
          })}
          </View>
        );
      })()}
      
      {/* Fallback: Default button if no children (backward compatibility) */}
      {!children && (
      <View style={{
        alignSelf: "flex-start",
        paddingBottom: 20
      }}>
        <Button
          iconAlign="left"
          type='link'
          href='Shop'
          style="clear"
          iconName="arrow-forward"
            color={effectiveTextColor}
            title={ctaText}
          buttonStyle={{ backgroundColor: 'white' }}
          contentStyle={{
              fontSize: props.fontSize ? (typeof props.fontSize === 'string' ? 
                ({ xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 20 }[props.fontSize.toLowerCase()] || 12) : 
                props.fontSize) : 12,
              padding: props.padding || props.buttonPadding || 12,
            fontWeight: 'bold',
              color: effectiveTextColor,
            letterSpacing: 1.5,
          }}
          elevated
          borderColor='white'
            height={props.buttonHeight || props.height || 40}
        />
      </View>
      )}
    </ImageBackground>
  );
}

export default MainBanner;