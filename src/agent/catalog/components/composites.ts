/**
 * Composite component schemas - containers that can have children
 */
import { z } from 'zod';

// View (basic container)
export const ViewPropsSchema = z.object({
  flex: z.number().optional(),
  flexDirection: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).default('column'),
  justifyContent: z.string().optional(),
  alignItems: z.string().optional(),
  padding: z.number().optional(),
  paddingHorizontal: z.number().optional(),
  paddingVertical: z.number().optional(),
  margin: z.number().optional(),
  marginHorizontal: z.number().optional(),
  marginVertical: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(),
  gap: z.number().optional(),
});

export const ViewDefinition = {
  props: ViewPropsSchema,
  hasChildren: true,
  description: 'Layout container view',
};

// Stack
export const StackPropsSchema = z.object({
  direction: z.enum(['horizontal', 'vertical']).default('vertical'),
  gap: z.number().default(0),
  align: z.string().optional(),
  justify: z.string().optional(),
  padding: z.number().optional(),
});

export const StackDefinition = {
  props: StackPropsSchema,
  hasChildren: true,
  description: 'Flex stack container',
};

// Grid
export const GridPropsSchema = z.object({
  columns: z.number().default(2),
  gap: z.number().default(10),
  rowGap: z.number().optional(),
  columnGap: z.number().optional(),
  padding: z.number().optional(),
});

export const GridDefinition = {
  props: GridPropsSchema,
  hasChildren: true,
  description: 'Grid layout container',
};

// Header
export const HeaderPropsSchema = z.object({
  label: z.string(),
  backgroundColor: z.string().default('white'),
  textColor: z.string().default('black'),
  height: z.number().optional(),
  paddingHorizontal: z.number().default(20),
  showProfile: z.boolean().default(true),
  profileHref: z.string().default('/profile'),
});

export const HeaderDefinition = {
  props: HeaderPropsSchema,
  hasChildren: true,
  description: 'Page header with title',
};

// MainBanner
export const MainBannerPropsSchema = z.object({
  imageUrl: z.string().optional(),
  title: z.string().default('JUST FOR YOU'),
  subtitle: z.string().optional(),
  ctaText: z.string().default('SHOP ALL'),
  ctaHref: z.string().default('Shop'),
  overlayColor: z.string().optional(),
  titleBackgroundColor: z.string().default('white'),
  height: z.number().default(300),
  paddingVertical: z.number().default(20),
});

export const MainBannerDefinition = {
  props: MainBannerPropsSchema,
  hasChildren: true,
  description: 'Hero banner section with image and CTA',
};

// ProductCard (composite of atomics)
export const ProductCardPropsSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(['display', 'row', 'column', 'cart']).default('display'),
  width: z.number().optional(),
  height: z.number().optional(),
  imageUrl: z.string().optional(),
  price: z.string().optional(),
  priceValue: z.number().optional(),
  originalPrice: z.string().optional(),
  description1: z.string().optional(),
  description2: z.string().optional(),
  bannerTitle: z.string().optional(),
  bannerType: z.enum(['default', 'discount']).default('default'),
  showCart: z.boolean().default(true),
  rank: z.number().optional(),
  blockId: z.string().optional(),
});

export const ProductCardDefinition = {
  props: ProductCardPropsSchema,
  hasChildren: true,
  description: 'Product display card with image, price, and badge',
};

// ProductSlider
export const ProductSliderPropsSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(['mixed', 'grid', 'single']).default('mixed'),
  gap: z.number().default(5),
  numColumns: z.number().optional(),
  itemWidth: z.number().optional(),
  spacing: z.number().default(10),
  blockId: z.string().optional(),
});

export const ProductSliderDefinition = {
  props: ProductSliderPropsSchema,
  hasChildren: true,
  description: 'Horizontal product carousel',
};

// ProductList
export const ProductListPropsSchema = z.object({
  blockId: z.string().default('shop_grid'),
  numColumns: z.number().default(2),
  gap: z.number().default(10),
  itemHeight: z.number().optional(),
  showSearch: z.boolean().default(true),
  showFilters: z.boolean().default(true),
});

export const ProductListDefinition = {
  props: ProductListPropsSchema,
  hasChildren: true,
  description: 'Vertical product grid',
};

// Filter
export const FilterPropsSchema = z.object({
  filters: z.array(z.string()).default(['ALL', 'UNDER C$30', 'COTTON', 'MADE IN INDIA']),
  activeFilter: z.string().optional(),
  buttonStyle: z.enum(['outline', 'solid']).default('outline'),
  activeColor: z.string().default('#333'),
  gap: z.number().default(10),
  padding: z.number().default(10),
});

export const FilterDefinition = {
  props: FilterPropsSchema,
  hasChildren: true,
  description: 'Filter button bar',
};

// SearchBar
export const SearchBarPropsSchema = z.object({
  placeholder: z.string().default('Search products...'),
  backgroundColor: z.string().default('#f0f0f0'),
  iconColor: z.string().default('#888'),
  textColor: z.string().default('#000'),
  height: z.number().default(40),
});

export const SearchBarDefinition = {
  props: SearchBarPropsSchema,
  hasChildren: false,
  description: 'Search input with icon',
};

// AddToCartButton
export const AddToCartButtonPropsSchema = z.object({
  initialQuantity: z.number().default(0),
  maxQuantity: z.number().default(10),
  minQuantity: z.number().default(0),
  buttonStyle: z.enum(['outline', 'solid']).default('outline'),
  buttonColor: z.string().default('black'),
});

export const AddToCartButtonDefinition = {
  props: AddToCartButtonPropsSchema,
  hasChildren: false,
  description: 'Add to cart button with quantity controls',
};

// BottomNavigation
export const BottomNavigationPropsSchema = z.object({
  backgroundColor: z.string().default('white'),
  iconColor: z.string().default('#595959'),
  activeIndicatorColor: z.string().default('black'),
  showCartCount: z.boolean().default(true),
  showWishlistCount: z.boolean().default(true),
  height: z.number().default(60),
});

export const BottomNavigationDefinition = {
  props: BottomNavigationPropsSchema,
  hasChildren: true,
  description: 'Bottom tab navigation bar',
};

// Message/Modal
export const MessagePropsSchema = z.object({
  type: z.enum(['modal', 'message']).default('message'),
  visible: z.boolean().default(false),
  heading: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().default('OK'),
});

export const MessageDefinition = {
  props: MessagePropsSchema,
  hasChildren: false,
  description: 'Notification or modal dialog',
};

// Export types
export type ViewProps = z.infer<typeof ViewPropsSchema>;
export type StackProps = z.infer<typeof StackPropsSchema>;
export type GridProps = z.infer<typeof GridPropsSchema>;
export type HeaderProps = z.infer<typeof HeaderPropsSchema>;
export type MainBannerProps = z.infer<typeof MainBannerPropsSchema>;
export type ProductCardProps = z.infer<typeof ProductCardPropsSchema>;
export type ProductSliderProps = z.infer<typeof ProductSliderPropsSchema>;
export type ProductListProps = z.infer<typeof ProductListPropsSchema>;
export type FilterProps = z.infer<typeof FilterPropsSchema>;
export type SearchBarProps = z.infer<typeof SearchBarPropsSchema>;
export type AddToCartButtonProps = z.infer<typeof AddToCartButtonPropsSchema>;
export type BottomNavigationProps = z.infer<typeof BottomNavigationPropsSchema>;
export type MessageProps = z.infer<typeof MessagePropsSchema>;
