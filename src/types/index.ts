export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "OWNER" | "USER";
  restaurantId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  restaurantId: string;
  userId?: string | null;
  sessionId: string;
  title?: string | null;
  summary?: string | null;
  isActive: boolean;
  isEscalated: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  lead?: Lead | null;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  metadata?: MessageMetadata | null;
  tokensUsed?: number | null;
  createdAt: Date;
}

export interface MessageMetadata {
  sources?: DocumentSource[];
  intent?: string;
  confidence?: number;
  toolCalls?: ToolCall[];
}

export interface DocumentSource {
  documentId: string;
  documentName: string;
  chunk: string;
  score: number;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface Lead {
  id: string;
  restaurantId: string;
  conversationId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  inquiry?: string | null;
  summary?: string | null;
  score: number;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  source?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  conversationId?: string | null;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  partySize: number;
  date: Date;
  timeSlot: string;
  specialRequests?: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  confirmationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  restaurantId: string;
  name: string;
  type: string;
  driveFileId?: string | null;
  driveUrl?: string | null;
  size?: number | null;
  mimeType?: string | null;
  isIndexed: boolean;
  indexedAt?: Date | null;
  syncStatus: "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  restaurantId: string;
  date: Date;
  totalChats: number;
  totalMessages: number;
  totalLeads: number;
  totalReservations: number;
  avgSessionDuration?: number | null;
  topIntents?: Record<string, number> | null;
  topQuestions?: string[] | null;
}

export interface AdminSettings {
  id: string;
  restaurantId: string;
  aiPersonality?: string | null;
  systemPrompt?: string | null;
  welcomeMessage?: string | null;
  businessHours?: BusinessHours | null;
  reservationSettings?: ReservationSettings | null;
  emailNotifications?: EmailNotificationSettings | null;
  googleDriveFolderIds: string[];
  autoSync: boolean;
  syncIntervalMinutes: number;
  maxConversationLength: number;
  escalationThreshold: number;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface ReservationSettings {
  maxPartySize: number;
  minPartySize: number;
  slotDurationMinutes: number;
  advanceBookingDays: number;
  timeSlots: string[];
}

export interface EmailNotificationSettings {
  reservationConfirmation: boolean;
  reservationReminder: boolean;
  leadNotification: boolean;
  escalationAlert: boolean;
  adminEmail: string;
}

export interface EmailLog {
  id: string;
  restaurantId: string;
  to: string;
  subject: string;
  template: string;
  status: "PENDING" | "SENT" | "FAILED" | "BOUNCED";
  attempts: number;
  sentAt?: Date | null;
  errorMessage?: string | null;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  sources?: DocumentSource[];
}

export interface StreamChunk {
  type: "text" | "tool_call" | "done" | "error";
  content?: string;
  toolCall?: ToolCall;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: number;
  modifiedTime?: string;
}

export interface DriveSyncResult {
  synced: number;
  failed: number;
  skipped: number;
  documents: Document[];
}

export interface LeadQualification {
  score: number;
  intent: string;
  isQualified: boolean;
  extractedInfo: {
    name?: string;
    email?: string;
    phone?: string;
    partySize?: number;
    preferredDate?: string;
    dietaryRestrictions?: string[];
  };
}

export interface RAGResult {
  answer: string;
  sources: DocumentSource[];
  confidence: number;
}
