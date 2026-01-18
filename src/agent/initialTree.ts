/**
 * ATOMIC UI TREE - Premium Homepage
 * 
 * Every element is a primitive (View, Text, Image, Button, Icon).
 * Every style is inline and fully customizable by the agent.
 * No composite components - everything is atomic.
 */

import { UITree } from './catalog';

// Design tokens for consistency
const colors = {
  background: '#ffffff',
  surface: '#fafafa',
  text: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#999999',
  accent: '#000000',
  border: '#e5e5e5',
  white: '#ffffff',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const initialHomeTree: UITree = {
  root: 'page',
  elements: {
    // ========================================
    // ROOT PAGE CONTAINER
    // ========================================
    'page': {
      key: 'page',
      type: 'View',
      props: {
        style: { 
          flex: 1, 
          backgroundColor: colors.background,
        }
      },
      children: ['header', 'content', 'bottom-nav'],
    },

    // ========================================
    // HEADER - Fully atomic
    // ========================================
    'header': {
      key: 'header',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }
      },
      children: ['header-menu', 'header-logo', 'header-actions'],
    },
    'header-menu': {
      key: 'header-menu',
      type: 'Icon',
      props: {
        name: 'bars',
        size: 24,
        color: colors.text,
      },
    },
    'header-logo': {
      key: 'header-logo',
      type: 'View',
      props: {
        style: { flexDirection: 'row', alignItems: 'center', gap: 4 }
      },
      children: ['header-logo-icon', 'header-logo-text'],
    },
    'header-logo-icon': {
      key: 'header-logo-icon',
      type: 'Text',
      props: {
        content: '✓',
        style: { fontSize: 18, fontWeight: 'bold', color: colors.text }
      },
    },
    'header-logo-text': {
      key: 'header-logo-text',
      type: 'Text',
      props: {
        content: 'off.vstore',
        style: { fontSize: 18, fontWeight: '600', color: colors.text }
      },
    },
    'header-actions': {
      key: 'header-actions',
      type: 'View',
      props: {
        style: { flexDirection: 'row', alignItems: 'center', gap: 16 }
      },
      children: ['header-about', 'header-faqs', 'header-cart'],
    },
    'header-about': {
      key: 'header-about',
      type: 'Text',
      props: {
        content: 'About',
        style: { fontSize: 14, color: colors.textMuted }
      },
    },
    'header-faqs': {
      key: 'header-faqs',
      type: 'Text',
      props: {
        content: 'FAQs',
        style: { fontSize: 14, color: colors.textMuted }
      },
    },
    'header-cart': {
      key: 'header-cart',
      type: 'Icon',
      props: {
        name: 'shoppingcart',
        size: 22,
        color: colors.text,
      },
    },

    // ========================================
    // MAIN CONTENT - Scrollable
    // ========================================
    'content': {
      key: 'content',
      type: 'ScrollView',
      props: {
        style: { flex: 1 },
        contentContainerStyle: { paddingBottom: 100 }
      },
      children: ['category-filter', 'hero', 'arrivals-section', 'offers-section', 'collections-section'],
    },

    // ========================================
    // CATEGORY FILTER - Horizontal pills
    // ========================================
    'category-filter': {
      key: 'category-filter',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }
      },
      children: ['filter-categories', 'filter-new', 'filter-search', 'filter-pills'],
    },
    'filter-categories': {
      key: 'filter-categories',
      type: 'View',
      props: {
        style: { flexDirection: 'row', alignItems: 'center', gap: 4 }
      },
      children: ['filter-categories-text', 'filter-categories-icon'],
    },
    'filter-categories-text': {
      key: 'filter-categories-text',
      type: 'Text',
      props: {
        content: 'Categories',
        style: { fontSize: 14, color: colors.text }
      },
    },
    'filter-categories-icon': {
      key: 'filter-categories-icon',
      type: 'Icon',
      props: { name: 'down', size: 12, color: colors.text },
    },
    'filter-new': {
      key: 'filter-new',
      type: 'View',
      props: {
        style: { flexDirection: 'row', alignItems: 'center', gap: 4 }
      },
      children: ['filter-new-text', 'filter-new-icon'],
    },
    'filter-new-text': {
      key: 'filter-new-text',
      type: 'Text',
      props: {
        content: 'New Product',
        style: { fontSize: 14, color: colors.text }
      },
    },
    'filter-new-icon': {
      key: 'filter-new-icon',
      type: 'Icon',
      props: { name: 'down', size: 12, color: colors.text },
    },
    'filter-search': {
      key: 'filter-search',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          gap: 8,
          flex: 1,
        }
      },
      children: ['filter-search-icon', 'filter-search-text'],
    },
    'filter-search-icon': {
      key: 'filter-search-icon',
      type: 'Icon',
      props: { name: 'search1', size: 16, color: colors.textLight },
    },
    'filter-search-text': {
      key: 'filter-search-text',
      type: 'Text',
      props: {
        content: 'search...',
        style: { fontSize: 14, color: colors.textLight }
      },
    },
    'filter-pills': {
      key: 'filter-pills',
      type: 'View',
      props: {
        style: { flexDirection: 'row', gap: spacing.sm }
      },
      children: ['pill-men', 'pill-women', 'pill-children', 'pill-brands'],
    },
    'pill-men': {
      key: 'pill-men',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }
      },
      children: ['pill-men-text'],
    },
    'pill-men-text': {
      key: 'pill-men-text',
      type: 'Text',
      props: {
        content: 'Men',
        style: { fontSize: 14, color: colors.text }
      },
    },
    'pill-women': {
      key: 'pill-women',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }
      },
      children: ['pill-women-text'],
    },
    'pill-women-text': {
      key: 'pill-women-text',
      type: 'Text',
      props: {
        content: 'Women',
        style: { fontSize: 14, color: colors.text }
      },
    },
    'pill-children': {
      key: 'pill-children',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }
      },
      children: ['pill-children-text'],
    },
    'pill-children-text': {
      key: 'pill-children-text',
      type: 'Text',
      props: {
        content: 'Children',
        style: { fontSize: 14, color: colors.text }
      },
    },
    'pill-brands': {
      key: 'pill-brands',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }
      },
      children: ['pill-brands-text'],
    },
    'pill-brands-text': {
      key: 'pill-brands-text',
      type: 'Text',
      props: {
        content: 'Brands',
        style: { fontSize: 14, color: colors.text }
      },
    },

    // ========================================
    // HERO SECTION - Full width banner
    // ========================================
    'hero': {
      key: 'hero',
      type: 'ImageBackground',
      props: {
        source: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=600&fit=crop',
        style: {
          height: 400,
          justifyContent: 'flex-end',
          padding: spacing.xl,
        }
      },
      children: ['hero-content'],
    },
    'hero-content': {
      key: 'hero-content',
      type: 'View',
      props: {
        style: {
          maxWidth: 400,
        }
      },
      children: ['hero-title', 'hero-subtitle', 'hero-cta'],
    },
    'hero-title': {
      key: 'hero-title',
      type: 'Text',
      props: {
        content: 'We are digital meets fashions',
        style: {
          fontSize: 36,
          fontWeight: '300',
          color: colors.white,
          marginBottom: spacing.sm,
          lineHeight: 42,
        }
      },
    },
    'hero-subtitle': {
      key: 'hero-subtitle',
      type: 'Text',
      props: {
        content: 'Show your vstore pride, get high-quality swag directly from the vstore foundation.',
        style: {
          fontSize: 14,
          color: colors.white,
          opacity: 0.9,
          marginBottom: spacing.lg,
          lineHeight: 20,
        }
      },
    },
    'hero-cta': {
      key: 'hero-cta',
      type: 'Button',
      props: {
        title: 'Start shopping',
        iconName: 'arrowright',
        iconPosition: 'right',
        iconSize: 16,
        iconColor: colors.text,
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 30,
          gap: 8,
          alignSelf: 'flex-start',
        },
        textStyle: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
        }
      },
    },

    // ========================================
    // ARRIVALS SECTION
    // ========================================
    'arrivals-section': {
      key: 'arrivals-section',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xl,
        }
      },
      children: ['arrivals-header', 'arrivals-grid'],
    },
    'arrivals-header': {
      key: 'arrivals-header',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        }
      },
      children: ['arrivals-title', 'arrivals-nav', 'arrivals-viewall'],
    },
    'arrivals-title': {
      key: 'arrivals-title',
      type: 'Text',
      props: {
        content: 'New arrival',
        style: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
        }
      },
    },
    'arrivals-nav': {
      key: 'arrivals-nav',
      type: 'View',
      props: {
        style: { flexDirection: 'row', gap: 8 }
      },
      children: ['arrivals-prev', 'arrivals-next'],
    },
    'arrivals-prev': {
      key: 'arrivals-prev',
      type: 'Icon',
      props: { name: 'left', size: 16, color: colors.textLight },
    },
    'arrivals-next': {
      key: 'arrivals-next',
      type: 'Icon',
      props: { name: 'right', size: 16, color: colors.text },
    },
    'arrivals-viewall': {
      key: 'arrivals-viewall',
      type: 'Text',
      props: {
        content: 'View all',
        style: { fontSize: 14, color: colors.textMuted }
      },
    },
    'arrivals-grid': {
      key: 'arrivals-grid',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
        }
      },
      children: ['product-1', 'product-2', 'product-3', 'product-4'],
    },

    // ========================================
    // PRODUCT CARDS - Fully atomic
    // ========================================
    'product-1': {
      key: 'product-1',
      type: 'View',
      props: {
        style: { width: '48%' }
      },
      children: ['product-1-image', 'product-1-info'],
    },
    'product-1-image': {
      key: 'product-1-image',
      type: 'Image',
      props: {
        source: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
        style: {
          width: '100%',
          height: 200,
          borderRadius: 8,
          backgroundColor: colors.surface,
        }
      },
    },
    'product-1-info': {
      key: 'product-1-info',
      type: 'View',
      props: {
        style: { paddingTop: spacing.sm }
      },
      children: ['product-1-title', 'product-1-price'],
    },
    'product-1-title': {
      key: 'product-1-title',
      type: 'Text',
      props: {
        content: 'Suede-effect jacket',
        style: { fontSize: 14, color: colors.text, marginBottom: 4 }
      },
    },
    'product-1-price': {
      key: 'product-1-price',
      type: 'Text',
      props: {
        content: '$119.99',
        style: { fontSize: 14, fontWeight: '600', color: colors.text }
      },
    },

    'product-2': {
      key: 'product-2',
      type: 'View',
      props: {
        style: { width: '48%' }
      },
      children: ['product-2-image', 'product-2-badge', 'product-2-info'],
    },
    'product-2-image': {
      key: 'product-2-image',
      type: 'Image',
      props: {
        source: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop',
        style: {
          width: '100%',
          height: 200,
          borderRadius: 8,
          backgroundColor: colors.surface,
        }
      },
    },
    'product-2-badge': {
      key: 'product-2-badge',
      type: 'Badge',
      props: {
        text: 'Overshirts',
        style: {
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: colors.surface,
          borderRadius: 4,
        },
        textStyle: { color: colors.text, fontSize: 11 }
      },
    },
    'product-2-info': {
      key: 'product-2-info',
      type: 'View',
      props: {
        style: { paddingTop: spacing.sm }
      },
      children: ['product-2-title', 'product-2-price'],
    },
    'product-2-title': {
      key: 'product-2-title',
      type: 'Text',
      props: {
        content: '100% linen jacket',
        style: { fontSize: 14, color: colors.text, marginBottom: 4 }
      },
    },
    'product-2-price': {
      key: 'product-2-price',
      type: 'Text',
      props: {
        content: '$129.99',
        style: { fontSize: 14, fontWeight: '600', color: colors.text }
      },
    },

    'product-3': {
      key: 'product-3',
      type: 'View',
      props: {
        style: { width: '48%' }
      },
      children: ['product-3-image', 'product-3-info'],
    },
    'product-3-image': {
      key: 'product-3-image',
      type: 'Image',
      props: {
        source: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop',
        style: {
          width: '100%',
          height: 200,
          borderRadius: 8,
          backgroundColor: colors.surface,
        }
      },
    },
    'product-3-info': {
      key: 'product-3-info',
      type: 'View',
      props: {
        style: { paddingTop: spacing.sm }
      },
      children: ['product-3-title', 'product-3-price'],
    },
    'product-3-title': {
      key: 'product-3-title',
      type: 'Text',
      props: {
        content: 'Cream sweater',
        style: { fontSize: 14, color: colors.text, marginBottom: 4 }
      },
    },
    'product-3-price': {
      key: 'product-3-price',
      type: 'Text',
      props: {
        content: '$89.99',
        style: { fontSize: 14, fontWeight: '600', color: colors.text }
      },
    },

    'product-4': {
      key: 'product-4',
      type: 'View',
      props: {
        style: { width: '48%', position: 'relative' }
      },
      children: ['product-4-image', 'product-4-add', 'product-4-info'],
    },
    'product-4-image': {
      key: 'product-4-image',
      type: 'Image',
      props: {
        source: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
        style: {
          width: '100%',
          height: 200,
          borderRadius: 8,
          backgroundColor: colors.surface,
        }
      },
    },
    'product-4-add': {
      key: 'product-4-add',
      type: 'View',
      props: {
        style: {
          position: 'absolute',
          bottom: 70,
          right: 8,
          backgroundColor: colors.accent,
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }
      },
      children: ['product-4-add-icon'],
    },
    'product-4-add-icon': {
      key: 'product-4-add-icon',
      type: 'Icon',
      props: { name: 'plus', size: 16, color: colors.white },
    },
    'product-4-info': {
      key: 'product-4-info',
      type: 'View',
      props: {
        style: { paddingTop: spacing.sm }
      },
      children: ['product-4-title', 'product-4-price'],
    },
    'product-4-title': {
      key: 'product-4-title',
      type: 'Text',
      props: {
        content: 'Basic linen shirt',
        style: { fontSize: 14, color: colors.text, marginBottom: 4 }
      },
    },
    'product-4-price': {
      key: 'product-4-price',
      type: 'Text',
      props: {
        content: '$69.99',
        style: { fontSize: 14, fontWeight: '600', color: colors.text }
      },
    },

    // ========================================
    // OFFERS SECTION - Feature card
    // ========================================
    'offers-section': {
      key: 'offers-section',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
          gap: spacing.md,
        }
      },
      children: ['offers-image', 'offers-card'],
    },
    'offers-image': {
      key: 'offers-image',
      type: 'Image',
      props: {
        source: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=500&fit=crop',
        style: {
          width: '45%',
          height: 280,
          borderRadius: 8,
        }
      },
    },
    'offers-card': {
      key: 'offers-card',
      type: 'View',
      props: {
        style: {
          flex: 1,
          backgroundColor: '#fef3e8',
          borderRadius: 8,
          padding: spacing.lg,
          justifyContent: 'center',
        }
      },
      children: ['offers-badge', 'offers-title', 'offers-description', 'offers-cta'],
    },
    'offers-badge': {
      key: 'offers-badge',
      type: 'View',
      props: {
        style: {
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.textMuted,
          marginBottom: spacing.md,
        }
      },
      children: ['offers-badge-text'],
    },
    'offers-badge-text': {
      key: 'offers-badge-text',
      type: 'Text',
      props: {
        content: 'Offers',
        style: { fontSize: 12, color: colors.text }
      },
    },
    'offers-title': {
      key: 'offers-title',
      type: 'Text',
      props: {
        content: 'Exclusive fashion offers await',
        style: {
          fontSize: 22,
          fontWeight: '500',
          color: colors.text,
          marginBottom: spacing.sm,
          lineHeight: 28,
        }
      },
    },
    'offers-description': {
      key: 'offers-description',
      type: 'Text',
      props: {
        content: 'Unlock fashion favorites transform into affordable luxuries. Every selection within our Offer Section beckons you to embrace.',
        style: {
          fontSize: 13,
          color: colors.textMuted,
          lineHeight: 18,
          marginBottom: spacing.lg,
        }
      },
    },
    'offers-cta': {
      key: 'offers-cta',
      type: 'Button',
      props: {
        title: 'Try now',
        iconName: 'arrowright',
        iconPosition: 'right',
        iconSize: 14,
        iconColor: colors.white,
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#3b82f6',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 24,
          gap: 8,
          alignSelf: 'flex-start',
        },
        textStyle: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.white,
        }
      },
    },

    // ========================================
    // COLLECTIONS SECTION
    // ========================================
    'collections-section': {
      key: 'collections-section',
      type: 'View',
      props: {
        style: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xl,
        }
      },
      children: ['collections-header', 'collections-subtitle', 'collections-grid'],
    },
    'collections-header': {
      key: 'collections-header',
      type: 'Text',
      props: {
        content: 'Fresh arrivals and new selections.',
        style: {
          fontSize: 24,
          fontWeight: '400',
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }
      },
    },
    'collections-subtitle': {
      key: 'collections-subtitle',
      type: 'Text',
      props: {
        content: 'Curated picks just for you',
        style: {
          fontSize: 14,
          color: colors.textMuted,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }
      },
    },
    'collections-grid': {
      key: 'collections-grid',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          gap: spacing.md,
        }
      },
      children: ['collection-1', 'collection-2', 'collection-3'],
    },
    'collection-1': {
      key: 'collection-1',
      type: 'ImageBackground',
      props: {
        source: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop',
        style: {
          flex: 1,
          height: 250,
          borderRadius: 8,
          overflow: 'hidden',
          justifyContent: 'flex-end',
          padding: spacing.md,
        }
      },
      children: ['collection-1-btn'],
    },
    'collection-1-btn': {
      key: 'collection-1-btn',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 4,
          gap: 8,
          alignSelf: 'flex-start',
        }
      },
      children: ['collection-1-text', 'collection-1-icon'],
    },
    'collection-1-text': {
      key: 'collection-1-text',
      type: 'Text',
      props: {
        content: 'Add collections',
        style: { fontSize: 12, color: colors.text }
      },
    },
    'collection-1-icon': {
      key: 'collection-1-icon',
      type: 'Icon',
      props: { name: 'plus', size: 14, color: colors.text },
    },
    'collection-2': {
      key: 'collection-2',
      type: 'ImageBackground',
      props: {
        source: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
        style: {
          flex: 1,
          height: 250,
          borderRadius: 8,
          overflow: 'hidden',
          justifyContent: 'flex-end',
          padding: spacing.md,
        }
      },
      children: ['collection-2-btn'],
    },
    'collection-2-btn': {
      key: 'collection-2-btn',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 4,
          gap: 8,
          alignSelf: 'flex-start',
        }
      },
      children: ['collection-2-text', 'collection-2-icon'],
    },
    'collection-2-text': {
      key: 'collection-2-text',
      type: 'Text',
      props: {
        content: 'Add collections',
        style: { fontSize: 12, color: colors.text }
      },
    },
    'collection-2-icon': {
      key: 'collection-2-icon',
      type: 'Icon',
      props: { name: 'plus', size: 14, color: colors.text },
    },
    'collection-3': {
      key: 'collection-3',
      type: 'ImageBackground',
      props: {
        source: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
        style: {
          flex: 1,
          height: 250,
          borderRadius: 8,
          overflow: 'hidden',
          justifyContent: 'flex-end',
          padding: spacing.md,
        }
      },
      children: ['collection-3-btn'],
    },
    'collection-3-btn': {
      key: 'collection-3-btn',
      type: 'View',
      props: {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 4,
          gap: 8,
          alignSelf: 'flex-start',
        }
      },
      children: ['collection-3-text', 'collection-3-icon'],
    },
    'collection-3-text': {
      key: 'collection-3-text',
      type: 'Text',
      props: {
        content: 'Add collections',
        style: { fontSize: 12, color: colors.text }
      },
    },
    'collection-3-icon': {
      key: 'collection-3-icon',
      type: 'Icon',
      props: { name: 'plus', size: 14, color: colors.text },
    },

    // ========================================
    // BOTTOM NAVIGATION - Fully atomic
    // ========================================
    'bottom-nav': {
      key: 'bottom-nav',
      type: 'View',
      props: {
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingVertical: spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }
      },
      children: ['nav-home', 'nav-search', 'nav-cart', 'nav-wishlist', 'nav-club'],
    },
    'nav-home': {
      key: 'nav-home',
      type: 'Image',
      props: {
        source: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
        style: { width: 40, height: 40 }
      },
    },
    'nav-search': {
      key: 'nav-search',
      type: 'Icon',
      props: { name: 'search1', size: 24, color: colors.text },
    },
    'nav-cart': {
      key: 'nav-cart',
      type: 'View',
      props: {
        style: { position: 'relative' }
      },
      children: ['nav-cart-icon', 'nav-cart-badge'],
    },
    'nav-cart-icon': {
      key: 'nav-cart-icon',
      type: 'Icon',
      props: { name: 'shoppingcart', size: 24, color: colors.text },
    },
    'nav-cart-badge': {
      key: 'nav-cart-badge',
      type: 'View',
      props: {
        style: {
          position: 'absolute',
          top: -4,
          right: -8,
          backgroundColor: colors.accent,
          width: 16,
          height: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }
      },
      children: ['nav-cart-count'],
    },
    'nav-cart-count': {
      key: 'nav-cart-count',
      type: 'Text',
      props: {
        content: '0',
        style: { fontSize: 10, color: colors.white, fontWeight: 'bold' }
      },
    },
    'nav-wishlist': {
      key: 'nav-wishlist',
      type: 'View',
      props: {
        style: { position: 'relative' }
      },
      children: ['nav-wishlist-icon', 'nav-wishlist-badge'],
    },
    'nav-wishlist-icon': {
      key: 'nav-wishlist-icon',
      type: 'Icon',
      props: { name: 'hearto', size: 24, color: colors.text },
    },
    'nav-wishlist-badge': {
      key: 'nav-wishlist-badge',
      type: 'View',
      props: {
        style: {
          position: 'absolute',
          top: -4,
          right: -8,
          backgroundColor: colors.accent,
          width: 16,
          height: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }
      },
      children: ['nav-wishlist-count'],
    },
    'nav-wishlist-count': {
      key: 'nav-wishlist-count',
      type: 'Text',
      props: {
        content: '0',
        style: { fontSize: 10, color: colors.white, fontWeight: 'bold' }
      },
    },
    'nav-club': {
      key: 'nav-club',
      type: 'Text',
      props: {
        content: 'adiClub',
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: colors.text,
        }
      },
    },
  },
};

export default initialHomeTree;
