import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ChatMessage, type Conversation } from "@/types";

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  restaurantId: string | null;

  setRestaurantId: (id: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateLastMessage: (conversationId: string, content: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;
  getActiveMessages: () => ChatMessage[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messages: {},
      isLoading: false,
      isStreaming: false,
      streamingContent: "",
      restaurantId: null,

      setRestaurantId: (id) => set({ restaurantId: id }),

      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),

      addMessage: (conversationId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              message,
            ],
          },
        })),

      updateLastMessage: (conversationId, content) =>
        set((state) => {
          const msgs = state.messages[conversationId] || [];
          const updated = [...msgs];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content,
            };
          }
          return { messages: { ...state.messages, [conversationId]: updated } };
        }),

      setIsLoading: (isLoading) => set({ isLoading }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setStreamingContent: (streamingContent) => set({ streamingContent }),
      appendStreamingContent: (chunk) =>
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
        })),
      clearStreamingContent: () => set({ streamingContent: "" }),

      getActiveMessages: () => {
        const { activeConversationId, messages } = get();
        if (!activeConversationId) return [];
        return messages[activeConversationId] || [];
      },
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 20),
        activeConversationId: state.activeConversationId,
        restaurantId: state.restaurantId,
      }),
    }
  )
);
