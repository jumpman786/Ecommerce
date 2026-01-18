import { z } from 'zod';

export const ButtonPropsSchema = z.object({
  title: z.string().default(''),
  style: z.enum(['solid', 'outline', 'clear']).optional(),
  variant: z.enum(['solid', 'outline', 'clear']).optional(),
  color: z.string().default('primary'),
  iconName: z.string().optional(),
  iconAlign: z.enum(['left', 'right', 'top', 'bottom']).default('right'),
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false),
  width: z.number().optional(),
  height: z.number().optional(),
  fullWidth: z.boolean().default(false),
  elevated: z.boolean().default(false),
  borderColor: z.string().optional(),
  type: z.enum(['normal', 'link', 'external']).default('normal'),
  href: z.string().optional(),
  // Analytics tracking
  trackEvent: z.object({
    eventName: z.string(),
    properties: z.record(z.unknown()).optional(),
    trackOnMount: z.boolean().optional(),
    trackOnPress: z.boolean().optional(),
  }).optional(),
  // Action trigger
  action: z.object({
    name: z.string(),
    params: z.record(z.unknown()).optional(),
  }).optional(),
});

export type ButtonProps = z.infer<typeof ButtonPropsSchema>;

export const ButtonDefinition = {
  props: ButtonPropsSchema,
  hasChildren: false,
  description: 'Interactive button with solid/outline/clear styles, icons, and loading states',
};
