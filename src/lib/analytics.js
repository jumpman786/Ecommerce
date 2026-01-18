// src/lib/analytics.js (rename from .ts to .js)
import { posthog } from './posthog';

/**
 * Track when a product is viewed in a list/grid
 */
export const trackProductImpression = (product, rank, blockId) => {
  posthog.capture('product_impression', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    rank: rank,
    block_id: blockId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a product detail page is viewed
 */
export const trackProductView = (product) => {
  posthog.capture('product_viewed', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a product is clicked
 */
export const trackProductClick = (product, rank, blockId) => {
  posthog.capture('product_click', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    rank: rank,
    block_id: blockId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a product is added to cart
 */
export const trackAddToCart = (product, quantity = 1, ctaText = '') => {
  posthog.capture('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    quantity: quantity,
    cta_text: ctaText,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a product is removed from cart
 */
export const trackRemoveFromCart = (product) => {
  posthog.capture('remove_from_cart', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track search queries
 */
export const trackSearch = (query, resultCount) => {
  posthog.capture('search_performed', {
    search_query: query,
    result_count: resultCount,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when checkout is initiated
 */
export const trackCheckoutStarted = (cartTotal, itemCount) => {
  posthog.capture('checkout_started', {
    cart_total: cartTotal,
    item_count: itemCount,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track completed purchases
 */
export const trackPurchase = (orderId, total, items) => {
  posthog.capture('purchase_completed', {
    order_id: orderId,
    total: total,
    item_count: items.length,
    items: items,
    timestamp: new Date().toISOString(),
  });
};