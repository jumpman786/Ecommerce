/**
 * Component Wrappers with Analytics
 *
 * These wrap the original app components to add:
 * - Analytics tracking via PostHog
 * - Action handling
 * - Theme support
 */
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentRenderProps, ComponentRegistry } from './index';
import { posthog } from '../../lib/posthog';

// Import original components
import Button from '../../components/Button';
import Product from '../../components/Product';
import Header from '../../components/Header';
import MainBanner from '../../components/MainBanner';
import Timer from '../../components/Timer';
import FlickerText from '../../components/FlickerText';
import Icon from '../../components/Icon';
import Filter from '../../components/Filter';
import SearchBar from '../../components/SearchBar';
import AddToCartButton from '../../components/AddToCartButton';
import BottomNavigation from '../../components/BottomNavigation';
import Message from '../../components/Message';

/**
 * Higher-order component that adds analytics tracking
 */
function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<ComponentRenderProps & { componentProps?: P }> {
  return function AnalyticsWrapper({ element, children, onAction, componentProps }) {
    const { trackEvent, action } = element;

    // Track on mount (impressions)
    useEffect(() => {
      if (trackEvent?.trackOnMount) {
        posthog.capture(trackEvent.eventName, {
          ...trackEvent.properties,
          component_key: element.key,
          component_type: element.type,
        });
      }
    }, []);

    // Handle press with tracking and action
    const handlePress = (...args: any[]) => {
      // Track press event
      if (trackEvent && trackEvent.trackOnPress !== false) {
        posthog.capture(trackEvent.eventName, {
          ...trackEvent.properties,
          component_key: element.key,
          component_type: element.type,
          action: 'press',
        });
      }

      // Execute action
      if (action && onAction) {
        onAction(action);
      }

      // Call original onPress
      const props = element.props as any;
      if (typeof props.onPress === 'function') {
        props.onPress(...args);
      }
    };

    const props = {
      ...element.props,
      ...componentProps,
      onPress: handlePress,
    } as P;

    return (
      <WrappedComponent {...props}>
        {children}
      </WrappedComponent>
    );
  };
}

/**
 * Button wrapper
 */
export const ButtonWrapper: React.FC<ComponentRenderProps> = ({
  element,
  children,
  onAction,
}) => {
  const { trackEvent, action } = element;
  const props = element.props;

  const handlePress = () => {
    // Track
    if (trackEvent && trackEvent.trackOnPress !== false) {
      posthog.capture(trackEvent.eventName || 'button_click', {
        ...trackEvent.properties,
        component_key: element.key,
        title: props.title,
      });
    }

    // Action
    if (action && onAction) {
      onAction(action);
    }
  };

  return (
    <Button
      title={props.title as string}
      color={props.color as string}
      style={props.style as any}
      variant={props.variant as string}
      type={props.type as string}
      iconName={props.iconName as string}
      iconAlign={props.iconAlign as string}
      disabled={props.disabled as boolean}
      loading={props.loading as boolean}
      width={props.width as any}
      height={props.height as any}
      fullWidth={props.fullWidth as boolean}
      elevated={props.elevated as boolean}
      borderColor={props.borderColor as string}
      href={props.href as string}
      onPress={handlePress}
    >
      {children}
    </Button>
  );
};

/**
 * Product wrapper
 */
export const ProductWrapper: React.FC<ComponentRenderProps> = ({
  element,
  onAction,
}) => {
  const { trackEvent, action } = element;
  const props = element.props;

  // Track impression on mount
  useEffect(() => {
    if (trackEvent?.trackOnMount) {
      posthog.capture('product_impression', {
        product_id: props.id,
        product_name: props.name,
        price: props.priceValue,
        rank: props.rank,
        block_id: props.blockId,
      });
    }
  }, []);

  const handlePress = () => {
    // Track click
    posthog.capture('product_click', {
      product_id: props.id,
      product_name: props.name,
      price: props.priceValue,
      rank: props.rank,
      block_id: props.blockId,
    });

    // Action
    if (action && onAction) {
      onAction(action);
    }
  };

  return (
    <Product
      id={props.id as any}
      name={props.name as any}
      type={props.type as any}
      width={props.width as any}
      height={props.height as any}
      imageUrl={props.imageUrl as any}
      price={props.price as any}
      priceValue={props.priceValue as any}
      description1={props.description1 as any}
      description2={props.description2 as any}
      bannerTitle={props.bannerTitle as any}
      bannerType={props.bannerType as any}
      cart={props.showCart as any}
      rank={props.rank as any}
      blockId={props.blockId as any}
      onPress={handlePress}
      onLikePress={() => {}}
    />
  );
};

/**
 * Header wrapper
 */
export const HeaderWrapper: React.FC<ComponentRenderProps> = ({
  element,
  children,
}) => {
  const props = element.props;

  return (
    <Header
      label={props.label as string}
    />
  );
};

/**
 * MainBanner wrapper
 */
export const MainBannerWrapper: React.FC<ComponentRenderProps> = ({
  element,
  children,
}) => {
  const props = element.props;

  // MainBanner might need customization to accept all these props
  return (
    <MainBanner />
  );
};

/**
 * Timer wrapper
 */
export const TimerWrapper: React.FC<ComponentRenderProps> = ({
  element,
}) => {
  const props = element.props;

  return (
    <Timer
      initialHours={props.initialHours as number}
      initialMinutes={props.initialMinutes as number}
    />
  );
};

/**
 * FlickerText wrapper
 */
export const FlickerTextWrapper: React.FC<ComponentRenderProps> = ({
  element,
  children,
}) => {
  const props = element.props;

  return (
    <FlickerText
      flickerColors={props.flickerColors as string[]}
      speed={props.speed as number}
      style={props.style}
    >
      {children || props.text}
    </FlickerText>
  );
};

/**
 * Icon wrapper
 */
export const IconWrapper: React.FC<ComponentRenderProps> = ({
  element,
}) => {
  const props = element.props;

  return (
    <Icon
      name={props.name as string}
      size={props.size as number}
      color={props.color as string}
      style={props.style as any}
    />
  );
};

/**
 * Badge component (simple implementation)
 */
export const BadgeWrapper: React.FC<ComponentRenderProps> = ({
  element,
}) => {
  const props = element.props;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: props.backgroundColor as string || 'red',
          borderRadius: props.borderRadius as number || 4,
          padding: props.padding as number || 4,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: props.textColor as string || 'white',
            fontSize: props.fontSize as number || 10,
          },
        ]}
      >
        {props.text as string}
      </Text>
    </View>
  );
};

/**
 * Extended registry with all app components
 */
export const appRegistry: ComponentRegistry = {
  // Atomic
  Button: ButtonWrapper,
  Icon: IconWrapper,
  Badge: BadgeWrapper,
  Timer: TimerWrapper,
  FlickerText: FlickerTextWrapper,

  // Composite
  Header: HeaderWrapper,
  MainBanner: MainBannerWrapper,
  Product: ProductWrapper,
  ProductCard: ProductWrapper,

  // Basic (from default registry)
  View: ({ element, children }) => (
    <View style={element.props.style as any}>{children}</View>
  ),
  Text: ({ element, children }) => (
    <Text style={element.props.style as any}>
      {element.props.content as string || children}
    </Text>
  ),
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  badgeText: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default appRegistry;
