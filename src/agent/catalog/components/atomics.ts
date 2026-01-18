/**
 * Atomic component schemas - the smallest customizable units
 */
import { z } from 'zod';

// Base tracking prop
export const TrackEventSchema = z.object({
  eventName: z.string(),
  properties: z.record(z.unknown()).optional(),
  trackOnMount: z.boolean().optional(),
  trackOnPress: z.boolean().optional(),
});

// Base action prop
export const ActionTriggerSchema = z.object({
  name: z.string(),
  params: z.record(z.unknown()).optional(),
  confirm: z.object({
    title: z.string(),
    message: z.string(),
    variant: z.enum(['default', 'danger']).optional(),
  }).optional(),
});

// Text
export const TextPropsSchema = z.object({
  content: z.string().default(''),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  letterSpacing: z.number().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  numberOfLines: z.number().optional(),
});

export const TextDefinition = {
  props: TextPropsSchema,
  hasChildren: true,
  description: 'Text display component',
};

// Image
export const ImagePropsSchema = z.object({
  source: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  contentFit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
  borderRadius: z.number().optional(),
  alt: z.string().optional(),
});

export const ImageDefinition = {
  props: ImagePropsSchema,
  hasChildren: false,
  description: 'Image display component',
};

// Icon
export const IconPropsSchema = z.object({
  name: z.string(),
  size: z.number().default(24),
  color: z.string().default('black'),
  library: z.enum(['antdesign', 'material', 'feather', 'fontawesome']).default('antdesign'),
});

export const IconDefinition = {
  props: IconPropsSchema,
  hasChildren: false,
  description: 'Vector icon component',
};

// Badge
export const BadgePropsSchema = z.object({
  text: z.string(),
  backgroundColor: z.string().default('red'),
  textColor: z.string().default('white'),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']).default('top-left'),
  fontSize: z.number().default(10),
  padding: z.number().default(4),
  borderRadius: z.number().default(4),
});

export const BadgeDefinition = {
  props: BadgePropsSchema,
  hasChildren: false,
  description: 'Small label/tag badge for sales, new items, etc.',
};

// Timer
export const TimerPropsSchema = z.object({
  initialHours: z.number().default(0),
  initialMinutes: z.number().default(0),
  initialSeconds: z.number().default(0),
  backgroundColor: z.string().default('white'),
  textColor: z.string().default('black'),
  fontSize: z.number().default(14),
  padding: z.number().default(8),
});

export const TimerDefinition = {
  props: TimerPropsSchema,
  hasChildren: false,
  description: 'Countdown timer for sales and promotions',
};

// FlickerText
export const FlickerTextPropsSchema = z.object({
  text: z.string(),
  flickerColors: z.array(z.string()).default(['red', 'orange']),
  speed: z.number().default(1000),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
});

export const FlickerTextDefinition = {
  props: FlickerTextPropsSchema,
  hasChildren: true,
  description: 'Animated color-flickering text for attention',
};

// Export types
export type TextProps = z.infer<typeof TextPropsSchema>;
export type ImageProps = z.infer<typeof ImagePropsSchema>;
export type IconProps = z.infer<typeof IconPropsSchema>;
export type BadgeProps = z.infer<typeof BadgePropsSchema>;
export type TimerProps = z.infer<typeof TimerPropsSchema>;
export type FlickerTextProps = z.infer<typeof FlickerTextPropsSchema>;
export type TrackEventProp = z.infer<typeof TrackEventSchema>;
export type ActionTrigger = z.infer<typeof ActionTriggerSchema>;
