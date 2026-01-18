/**
 * React hook for AI agent customization
 * Handles streaming SSE events from the backend
 */
import { useState, useCallback, useRef } from 'react';
import { UITree } from '../catalog';

// Simple theme type (themes removed, keeping for API compatibility)
export interface Theme {
  name: string;
  [key: string]: unknown;
}

export interface TodoItem {
  id: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'set';
  path: string;
  value?: unknown;
}

export interface CustomizeEvent {
  type:
    | 'status'
    | 'plan'
    | 'todo_update'
    | 'patch'
    | 'theme_update'
    | 'screenshot_request'
    | 'validation_warning'
    | 'error'
    | 'complete';
  message?: string;
  todos?: TodoItem[];
  patch?: PatchOperation;
  theme?: Theme;
  issues?: string[];
  request_id?: string;  // For screenshot requests
  session_id?: string;  // Session ID for matching agent
}

export interface UseAgentCustomizationOptions {
  apiEndpoint: string;
  sessionId?: string;  // Session ID for conversation persistence
  onTreeChange?: (tree: UITree) => void;
  onThemeChange?: (theme: Theme) => void;
  onPatch?: (patch: PatchOperation) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
  onScreenshotRequest?: () => Promise<string>;  // Returns base64 PNG
}

export interface UseAgentCustomizationResult {
  todos: TodoItem[];
  isCustomizing: boolean;
  error: string | null;
  statusMessage: string | null;
  customize: (prompt: string, currentTree: UITree, currentTheme?: Theme) => Promise<void>;
  cancel: () => void;
}

/**
 * Hook for interacting with the AI customization agent
 */
export function useAgentCustomization(
  options: UseAgentCustomizationOptions
): UseAgentCustomizationResult {
  const {
    apiEndpoint,
    sessionId,
    onTreeChange,
    onThemeChange,
    onPatch,
    onError,
    onComplete,
    onScreenshotRequest,
  } = options;

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Process SSE events - using ref to avoid stale closures
  const processEventRef = useRef<(event: CustomizeEvent) => void>(() => {});

  processEventRef.current = (event: CustomizeEvent) => {
    switch (event.type) {
      case 'status':
        setStatusMessage(event.message || null);
        break;

      case 'plan':
      case 'todo_update':
        if (event.todos) {
          setTodos(event.todos);
        }
        break;

      case 'patch':
        if (event.patch) {
          console.log('🔧 Applying patch:', event.patch.op, event.patch.path);
          onPatch?.(event.patch);
        }
        break;

      case 'theme_update':
        if (event.theme) {
          onThemeChange?.(event.theme);
        }
        break;

      case 'screenshot_request':
        console.log('📸 Screenshot requested, session:', event.session_id);
        // Handle asynchronously - don't block event processing
        if (onScreenshotRequest && event.session_id) {
          const sessionId = event.session_id;
          (async () => {
            try {
              console.log('📸 Capturing screenshot...');
              const screenshot = await onScreenshotRequest();
              
              // Only send if we got a real screenshot (>100 chars)
              if (!screenshot || screenshot.length < 100) {
                console.log('📸 Screenshot unavailable, letting backend timeout gracefully');
                return;
              }
              
              console.log('📸 Screenshot captured, length:', screenshot.length);
              
              // Send screenshot back to backend
              const response = await fetch(`${apiEndpoint}/api/screenshot/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: screenshot }),
              });
              console.log('📸 Screenshot sent, response:', response.status);
            } catch (e) {
              console.error('Failed to capture/send screenshot:', e);
            }
          })();
        } else {
          console.log('📸 No screenshot handler, skipping');
        }
        break;

      case 'validation_warning':
        console.warn('Validation warning:', event.issues);
        break;

      case 'error':
        setError(event.message || 'Unknown error');
        onError?.(event.message || 'Unknown error');
        break;

      case 'complete':
        setStatusMessage(event.message || 'Complete');
        if (event.todos) {
          setTodos(event.todos);
        }
        onComplete?.();
        break;
    }
  };

  const customize = useCallback(
    async (prompt: string, currentTree: UITree, currentTheme?: Theme) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsCustomizing(true);
      setError(null);
      setTodos([]);
      setStatusMessage('Starting customization...');

      try {
        const response = await fetch(`${apiEndpoint}/api/customize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            current_tree: currentTree,
            theme: currentTheme,
            session_id: sessionId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete events (lines ending with \n\n)
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse SSE data
            const dataMatch = line.match(/^data: (.+)$/m);
            if (!dataMatch) continue;

            try {
              const event: CustomizeEvent = JSON.parse(dataMatch[1]);
              processEventRef.current(event);
            } catch (e) {
              console.error('Failed to parse event:', e);
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          setStatusMessage('Cancelled');
        } else {
          const errorMsg = (e as Error).message;
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } finally {
        setIsCustomizing(false);
        abortControllerRef.current = null;
      }
    },
    [apiEndpoint, sessionId, onError]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCustomizing(false);
    setStatusMessage('Cancelled');
  }, []);

  return {
    todos,
    isCustomizing,
    error,
    statusMessage,
    customize,
    cancel,
  };
}

export default useAgentCustomization;
