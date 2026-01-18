/**
 * AgentPanel - UI for AI customization
 *
 * Features:
 * - Prompt input for customization requests
 * - Real-time todo list showing progress
 * - Example prompts
 * - Status messages
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Customization</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Prompt Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What would you like to customize?</Text>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="e.g., 'Change the banner title to MEGA SALE' or 'Make the banner background red'"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Customize</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Status Message */}
            {statusMessage && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="warning" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Todo List */}
            {todos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progress</Text>
                {todos.map((todo) => {
                  const icon = getStatusIcon(todo.status);
                  return (
                    <View key={todo.id} style={styles.todoItem}>
                      <Icon name={icon.name} size={16} color={icon.color} />
                      <Text
                        style={[
                          styles.todoText,
                          todo.status === 'completed' && styles.todoCompleted,
                          todo.status === 'failed' && styles.todoFailed,
                        ]}
                      >
                        {todo.task}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Example Prompts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Example Prompts</Text>
              <View style={styles.examples}>
                {[
                  'Change the banner title to MEGA SALE',
                  'Make the banner background red',
                  'Change the CTA button to say BUY NOW',
                  'Add a subtitle that says "Limited Time Only"',
                  'Make the banner title yellow',
                ].map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleButton}
                    onPress={() => setPrompt(example)}
                    disabled={isLoading}
                  >
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#374151',
    fontSize: 13,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  todoText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  todoFailed: {
    color: '#ef4444',
  },
  examples: {
    gap: 8,
  },
  exampleButton: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default AgentPanel;
