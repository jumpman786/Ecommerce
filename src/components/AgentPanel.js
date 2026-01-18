/**
 * AgentPanel - Floating AI customization panel
 *
 * Non-obstructive floating panel that lets you see UI changes in real-time.
 * Features:
 * - Collapsible/expandable
 * - Draggable position
 * - Real-time todo list showing progress
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from './Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// DEMO PROMPTS - Deterministic, flawless theme transformations
// ============================================================================
const DEMO_PROMPTS = {
  christmas: `Apply Christmas theme. Execute these modifications in order:

1. modify_component: hero, props: {style: {backgroundColor: "rgba(22,91,51,0.7)"}}
2. modify_component: hero-title, props: {content: "Holiday Collection", style: {color: "#FFD700", fontSize: 44, fontWeight: "700", textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: {width: 2, height: 2}, textShadowRadius: 6}}
3. modify_component: hero-subtitle, props: {content: "Celebrate the season with exclusive festive fashion", style: {color: "#ffffff", textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4}}
4. modify_component: hero-cta, props: {title: "Shop Holiday Deals", style: {backgroundColor: "#C41E3A", borderRadius: 25}, textStyle: {color: "#ffffff"}}
5. modify_component: header, props: {style: {backgroundColor: "#165B33"}}
6. modify_component: header-logo-text, props: {style: {color: "#FFD700"}}
7. modify_component: header-menu, props: {color: "#FFD700"}
8. modify_component: header-about, props: {style: {color: "#ffffff"}}
9. modify_component: header-faqs, props: {style: {color: "#ffffff"}}
10. modify_component: header-cart, props: {color: "#FFD700"}
11. modify_component: bottom-nav, props: {style: {backgroundColor: "#165B33", borderTopColor: "#0d3d22"}}
12. modify_component(componentKey="nav-search", props={"color": "#FFD700"})
13. modify_component(componentKey="nav-cart-icon", props={"color": "#ffffff"}) - IMPORTANT: key is "nav-cart-icon" not "nav-cart"
14. modify_component(componentKey="nav-wishlist-icon", props={"color": "#ffffff"}) - IMPORTANT: key is "nav-wishlist-icon" not "nav-wishlist"
15. modify_component: nav-club, props: {style: {color: "#FFD700"}}
16. modify_component: nav-cart-badge, props: {style: {backgroundColor: "#C41E3A"}}
17. modify_component: nav-wishlist-badge, props: {style: {backgroundColor: "#C41E3A"}}
18. modify_component: arrivals-title, props: {style: {color: "#C41E3A"}}
19. modify_component: page, props: {style: {backgroundColor: "#FDF6F0"}}
20. generate_image: prompt "Elegant Christmas fashion photoshoot, models in festive holiday outfits, pine branches, gold ornaments, soft snowfall, warm cream background, professional e-commerce hero image, no text overlay", targetComponent: hero, targetProp: source, width: 1200, height: 500

Execute ALL 20 steps. Do not skip any.`,

  blackFriday: `Apply Black Friday theme. Execute these modifications in order:

1. modify_component: hero, props: {style: {backgroundColor: "rgba(0,0,0,0.9)"}}
2. modify_component: hero-title, props: {content: "BLACK FRIDAY", style: {color: "#FFD700", fontSize: 52, fontWeight: "900", letterSpacing: 6, textShadowColor: "rgba(255,215,0,0.3)", textShadowOffset: {width: 0, height: 0}, textShadowRadius: 20}}
3. modify_component: hero-subtitle, props: {content: "Up to 70% OFF everything", style: {color: "#ffffff", fontSize: 20}}
4. modify_component: hero-cta, props: {title: "SHOP NOW", style: {backgroundColor: "#FFD700", borderRadius: 0, paddingHorizontal: 40}, textStyle: {color: "#000000", fontWeight: "800"}}
5. modify_component: header, props: {style: {backgroundColor: "#000000"}}
6. modify_component: header-logo-text, props: {style: {color: "#FFD700"}}
7. modify_component: header-menu, props: {color: "#FFD700"}
8. modify_component: header-about, props: {style: {color: "#ffffff"}}
9. modify_component: header-faqs, props: {style: {color: "#ffffff"}}
10. modify_component: header-cart, props: {color: "#FFD700"}
11. modify_component: bottom-nav, props: {style: {backgroundColor: "#000000", borderTopColor: "#333"}}
12. modify_component(componentKey="nav-search", props={"color": "#FFD700"})
13. modify_component(componentKey="nav-cart-icon", props={"color": "#FFD700"}) - key is "nav-cart-icon" NOT "nav-cart"
14. modify_component(componentKey="nav-wishlist-icon", props={"color": "#FFD700"}) - key is "nav-wishlist-icon" NOT "nav-wishlist"
15. modify_component: nav-club, props: {style: {color: "#FFD700"}}
16. modify_component: nav-cart-badge, props: {style: {backgroundColor: "#FF4444"}}
17. modify_component: nav-wishlist-badge, props: {style: {backgroundColor: "#FF4444"}}
18. modify_component: arrivals-title, props: {style: {color: "#FFD700"}}
19. modify_component: page, props: {style: {backgroundColor: "#111111"}}
20. generate_image: prompt "Luxury black and gold fashion, dramatic spotlight, elegant clothing on dark background, premium e-commerce style, no text", targetComponent: hero, targetProp: source, width: 1200, height: 500

Execute ALL 20 steps. Pure black and gold.`,

  summer: `Apply Summer theme. Execute these modifications in order:

1. modify_component: hero, props: {style: {backgroundColor: "rgba(0,180,216,0.75)"}}
2. modify_component: hero-title, props: {content: "Summer Essentials", style: {color: "#FEFAE0", fontSize: 44, fontWeight: "600", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: {width: 2, height: 2}, textShadowRadius: 4}}
3. modify_component: hero-subtitle, props: {content: "Light, breezy styles for sunny days ahead", style: {color: "#ffffff"}}
4. modify_component: hero-cta, props: {title: "Shop Summer", style: {backgroundColor: "#FF6B35", borderRadius: 25}, textStyle: {color: "#ffffff"}}
5. modify_component: header, props: {style: {backgroundColor: "#00B4D8"}}
6. modify_component: header-logo-text, props: {style: {color: "#FEFAE0"}}
7. modify_component: header-menu, props: {color: "#FEFAE0"}
8. modify_component: header-about, props: {style: {color: "#ffffff"}}
9. modify_component: header-faqs, props: {style: {color: "#ffffff"}}
10. modify_component: header-cart, props: {color: "#FEFAE0"}
11. modify_component: bottom-nav, props: {style: {backgroundColor: "#00B4D8", borderTopColor: "#0096b7"}}
12. modify_component(componentKey="nav-search", props={"color": "#FFE66D"})
13. modify_component(componentKey="nav-cart-icon", props={"color": "#ffffff"}) - key is "nav-cart-icon" NOT "nav-cart"
14. modify_component(componentKey="nav-wishlist-icon", props={"color": "#ffffff"}) - key is "nav-wishlist-icon" NOT "nav-wishlist"
15. modify_component: nav-club, props: {style: {color: "#FFE66D"}}
16. modify_component: nav-cart-badge, props: {style: {backgroundColor: "#FF6B35"}}
17. modify_component: nav-wishlist-badge, props: {style: {backgroundColor: "#FF6B35"}}
18. modify_component: arrivals-title, props: {style: {color: "#FF6B35"}}
19. modify_component: page, props: {style: {backgroundColor: "#FEFAE0"}}
20. generate_image: prompt "Summer beach fashion, tropical palm leaves, bright sunlight, ocean blue sky, models in light breezy clothing, professional lifestyle photography, no text", targetComponent: hero, targetProp: source, width: 1200, height: 500

Execute ALL 20 steps. Bright summer vibes.`,
};
const PANEL_WIDTH = Math.min(360, SCREEN_WIDTH - 32);

const AgentPanel = ({
  visible = false,
  onClose,
  onCustomize,
  todos = [],
  isLoading = false,
  statusMessage = null,
  error = null,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = useCallback(() => {
    if (prompt.trim() && onCustomize) {
      onCustomize(prompt.trim());
      setPrompt('');
    }
  }, [prompt, onCustomize]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { name: 'check', color: '#22c55e' };
      case 'in_progress':
        return { name: 'loading1', color: '#3b82f6' };
      case 'failed':
        return { name: 'close', color: '#ef4444' };
      default:
        return { name: 'clockcircleo', color: '#9ca3af' };
    }
  };

  const completedCount = todos.filter(t => t.status === 'completed').length;

  if (!visible) return null;

  return (
    <View style={styles.floatingContainer}>
      {/* Header - always visible */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Icon name="tool" size={16} color="#fff" />
          <Text style={styles.title}>AI Agent</Text>
          {todos.length > 0 && (
            <Text style={styles.progressBadge}>
              {completedCount}/{todos.length}
            </Text>
          )}
          {isLoading && <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 8 }} />}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.iconButton}>
            <Icon name={isExpanded ? 'down' : 'up'} size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
      </TouchableOpacity>

      {/* Expandable content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Prompt Input - Compact */}
          <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={setPrompt}
              placeholder="e.g., 'Black Friday theme'"
                placeholderTextColor="#9ca3af"
                editable={!isLoading}
              onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
              style={[styles.sendButton, (isLoading || !prompt.trim()) && styles.sendButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || !prompt.trim()}
              >
              <Icon name="arrowright" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

          {/* Status/Error - Compact */}
          {(statusMessage || error) && (
            <View style={[styles.statusBar, error && styles.errorBar]}>
              <Text style={[styles.statusText, error && styles.errorText]} numberOfLines={2}>
                {error || statusMessage}
              </Text>
              </View>
            )}

          {/* Todo List - Scrollable */}
            {todos.length > 0 && (
            <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}>
                {todos.map((todo) => {
                  const icon = getStatusIcon(todo.status);
                  return (
                    <View key={todo.id} style={styles.todoItem}>
                    <Icon name={icon.name} size={14} color={icon.color} />
                      <Text
                        style={[
                          styles.todoText,
                          todo.status === 'completed' && styles.todoCompleted,
                          todo.status === 'failed' && styles.todoFailed,
                        ]}
                      numberOfLines={2}
                      >
                        {todo.task}
                      </Text>
                    </View>
                  );
                })}
            </ScrollView>
            )}

          {/* Demo Presets - Deterministic prompts for flawless demos */}
          {todos.length === 0 && !isLoading && (
            <View style={styles.quickPrompts}>
              <Text style={styles.presetLabel}>🎯 Demo Presets:</Text>
              {[
                { label: '🎄 Christmas', key: 'christmas' },
                { label: '🏷️ Black Friday', key: 'blackFriday' },
                { label: '☀️ Summer', key: 'summer' },
              ].map((preset) => (
                  <TouchableOpacity
                  key={preset.key}
                  style={styles.quickButton}
                  onPress={() => {
                    const fullPrompt = DEMO_PROMPTS[preset.key];
                    setPrompt(fullPrompt);
                    if (onCustomize) onCustomize(fullPrompt);
                  }}
                >
                  <Text style={styles.quickText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      )}
      </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    width: PANEL_WIDTH,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 280,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  statusBar: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  errorBar: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    color: '#374151',
    fontSize: 12,
  },
  errorText: {
    color: '#ef4444',
  },
  todoList: {
    maxHeight: 150,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  todoText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  todoFailed: {
    color: '#ef4444',
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  presetLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginRight: 4,
  },
  quickButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});

export default AgentPanel;
