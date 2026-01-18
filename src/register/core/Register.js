import { store } from "../store";
import Renderer from "./Renderer";
import { Text, View, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import c from './constants';
import AntDesign from '@expo/vector-icons/AntDesign';

/**
 * ATOMIC COMPONENT REGISTER
 * 
 * Only primitive components that can be fully controlled from JSON.
 * Every style, every prop is passed directly from the tree.
 * No composite components - everything is atomic.
 */

class Register {
  components = {};
  functions = {};

  constructor({ components = {}, functions = {} } = {}, Wrapper = null) {
    if (Register.instance) {
      return Register.instance;
    }
    this.components = components;
    this.functions = functions;
    this.Wrapper = Wrapper;
    Register.instance = this;
  }

  getComponent = (name) => {
    const comp = this.components[name];
    if (!comp) {
      return this.components._Undefined?.component;
    }
    return comp.component;
  };

  callFunction = (name, attr, props, callerArgs) => {
    if (name in this.functions) {
      return this.functions[name](attr, props, callerArgs, this);
    }
    return null;
  };

  registerComponent = ({ name, component, type, properties }) => {
    if (!this.components[name]) {
      this.components[name] = { component, type, properties };
    }
  };

  async registerRemoteComponent({ name, schema, type, properties }) {
    this.components[name] = {
      component: () => <Renderer model={schema} />, 
      type, 
      properties
    };
  }

  async init() {
    // ========================================
    // PRIMITIVE COMPONENTS
    // Every prop comes directly from the tree
    // ========================================

    // View - Container with ANY style from tree
    this.registerComponent({
      name: 'View',
      component: ({ style, children, ...props }) => (
        <View style={style} {...props}>
          {children}
        </View>
      ),
      type: 'primitive',
      properties: {}
    });

    // Text - Text content with ANY style from tree
    this.registerComponent({
      name: 'Text',
      component: ({ style, children, content, ...props }) => (
        <Text style={style} {...props}>
          {content || children}
        </Text>
      ),
      type: 'primitive',
      properties: {}
    });
    
    // Image - Image with source and ANY style from tree
    this.registerComponent({
      name: 'Image',
      component: ({ source, style, contentFit, ...props }) => {
        // Handle different source formats
        let imageSource = source;
        let imageKey = 'img';
        
        if (typeof source === 'string') {
          if (source.startsWith('data:') || source.startsWith('http')) {
            imageSource = { uri: source };
          }
          // Create unique key based on source to force remount on change
          // For base64, use length as key (unique per image)
          // For URLs, use the URL itself
          if (source.startsWith('data:')) {
            imageKey = `b64-${source.length}`;
          } else {
            imageKey = source.substring(0, 100);
          }
        }
        
        return (
          <Image
            key={imageKey}
            source={imageSource}
            style={style}
            contentFit={contentFit || 'cover'}
            {...props}
          />
        );
      },
      type: 'primitive',
      properties: {}
    });

    // ScrollView - Scrollable container
    // Automatically moves layout styles to contentContainerStyle (RN requirement)
    this.registerComponent({
      name: 'ScrollView',
      component: ({ style, contentContainerStyle, children, ...props }) => {
        // Layout styles that must be in contentContainerStyle, not style
        const layoutKeys = ['alignItems', 'justifyContent', 'flexDirection', 'flexWrap', 'alignContent', 'gap', 'rowGap', 'columnGap'];
        
        // Extract layout styles from style and merge into contentContainerStyle
        const finalStyle = { ...style };
        const extractedLayout = {};
        
        for (const key of layoutKeys) {
          if (finalStyle && finalStyle[key] !== undefined) {
            extractedLayout[key] = finalStyle[key];
            delete finalStyle[key];
          }
        }
        
        const finalContentContainerStyle = {
          ...extractedLayout,
          ...contentContainerStyle,
        };
        
        return (
          <ScrollView
            style={finalStyle}
            contentContainerStyle={finalContentContainerStyle}
            showsVerticalScrollIndicator={false}
            {...props}
          >
            {children}
          </ScrollView>
        );
      },
      type: 'primitive',
      properties: {}
    });

    // Button - Pressable with ANY style from tree
    this.registerComponent({
      name: 'Button',
      component: ({ 
        title, 
        style, 
        textStyle, 
        onPress, 
        action,
        iconName,
        iconSize,
        iconColor,
        iconPosition,
        disabled,
        children,
        ...props 
      }) => {
        const handlePress = () => {
          if (disabled) return;
          if (action?.name) {
            // Handle action triggers
            console.log('Action:', action);
          }
          if (onPress) onPress();
        };

        const iconElement = iconName ? (
          <AntDesign 
            name={iconName} 
            size={iconSize || 16} 
            color={iconColor || (textStyle?.color || '#000')} 
          />
        ) : null;

        return (
          <Pressable
            onPress={handlePress}
            disabled={disabled}
            style={({ pressed }) => [
              style,
              pressed && { opacity: 0.8 }
            ]}
            {...props}
          >
            {iconPosition === 'left' && iconElement}
            {title && <Text style={textStyle}>{title}</Text>}
            {children}
            {iconPosition !== 'left' && iconElement}
          </Pressable>
        );
      },
      type: 'primitive',
      properties: {}
    });

    // Icon - Vector icon with name, size, color
    this.registerComponent({
      name: 'Icon',
      component: ({ name, size, color, style, ...props }) => (
        <AntDesign
          name={name || 'question'}
          size={size || 24}
          color={color || '#000'}
          style={style}
          {...props}
        />
      ),
      type: 'primitive',
      properties: {}
    });

    // Touchable - Generic touchable wrapper
    this.registerComponent({
      name: 'Touchable',
      component: ({ style, onPress, action, children, ...props }) => {
        const handlePress = () => {
          if (action?.name) {
            console.log('Action:', action);
          }
          if (onPress) onPress();
        };
        return (
          <TouchableOpacity style={style} onPress={handlePress} activeOpacity={0.7} {...props}>
            {children}
          </TouchableOpacity>
        );
      },
      type: 'primitive',
      properties: {}
    });

    // ImageBackground - View with background image
    this.registerComponent({
      name: 'ImageBackground',
      component: ({ source, style, imageStyle, children, ...props }) => {
        let imageSource = source;
        if (typeof source === 'string') {
          if (source.startsWith('data:') || source.startsWith('http')) {
            imageSource = { uri: source };
          }
        }
        return (
          <View style={[{ position: 'relative', overflow: 'hidden' }, style]} {...props}>
            <Image
              source={imageSource}
              style={[
                { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                imageStyle
              ]}
              contentFit="cover"
            />
            {children}
          </View>
        );
      },
      type: 'primitive',
      properties: {}
    });

    // ========================================
    // UTILITY COMPONENTS
    // ========================================

    // Spacer - Empty space
    this.registerComponent({
      name: 'Spacer',
      component: ({ size, horizontal, style }) => (
        <View style={[
          horizontal ? { width: size || 16 } : { height: size || 16 },
          style
        ]} />
      ),
      type: 'primitive',
      properties: {}
    });

    // Divider - Horizontal line
    this.registerComponent({
      name: 'Divider',
      component: ({ color, thickness, style }) => (
        <View style={[
          { 
            height: thickness || 1, 
            backgroundColor: color || '#e5e5e5',
            width: '100%'
          },
          style
        ]} />
      ),
      type: 'primitive',
      properties: {}
    });

    // Badge - Small label/tag
      this.registerComponent({
      name: 'Badge',
      component: ({ text, style, textStyle, children }) => (
        <View style={[
          { 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 4, 
            backgroundColor: '#000' 
          },
          style
        ]}>
          <Text style={[{ color: '#fff', fontSize: 12, fontWeight: 'bold' }, textStyle]}>
            {text || children}
          </Text>
        </View>
      ),
      type: 'primitive',
        properties: {}
      });

    // ========================================
    // INTERNAL COMPONENTS
    // ========================================

    this.registerComponent({
      name: c.PRIMITIVE_COMP_NAME,
      component: ({ children }) => <Text>{children}</Text>,
      type: 'primitive',
      properties: {}
    });

    this.registerComponent({
      name: c.FRAGMENT_COMP_NAME,
      component: ({ children }) => <>{children}</>,
      type: 'primitive',
      properties: {}
    });

    this.registerComponent({
      name: '_Undefined',
      component: ({ type, children, ...props }) => (
        <View style={{ padding: 8, backgroundColor: '#ffeeee', borderRadius: 4 }}>
          <Text style={{ color: '#cc0000', fontSize: 12 }}>
            Unknown: {type || props['v:name'] || 'component'}
          </Text>
          {children}
        </View>
      ),
      type: 'component',
      properties: {}
    });

    console.log('Register initialized with atomic primitives:', Object.keys(this.components));
  }

  registerFunction = (name, fn) => {
    this.functions[name] = fn;
  };

  static getInstance(initArgs = {}, Wrapper = null) {
    if (!Register.instance) {
      Register.instance = new Register(initArgs, Wrapper);
    }
    return Register.instance;
  }

  getComponentsByType(_type) {
    return Object.entries(this.components)
      .filter(([_, { type }]) => type === _type)
      .map(([name, { component, properties }]) => ({ name, component, properties }));
  }
  
  getComponentsByProperty(name, value) {
    return Object.entries(this.components)
      .filter(([_, { properties }]) => properties && properties[name] === value)
      .map(([key, { component, properties, type }]) => ({ name: key, component, properties, type }));
  }
}

export default Register;
