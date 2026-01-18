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

          {/* Quick prompts */}
          {todos.length === 0 && !isLoading && (
            <View style={styles.quickPrompts}>
              {['Christmas theme', 'Black Friday sale', 'Summer vibes'].map((example, index) => (
                  <TouchableOpacity
                    key={index}
                  style={styles.quickButton}
                  onPress={() => {
                    setPrompt(example);
                    if (onCustomize) onCustomize(example);
                  }}
                  >
                  <Text style={styles.quickText}>{example}</Text>
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
  },
  quickButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default AgentPanel;
