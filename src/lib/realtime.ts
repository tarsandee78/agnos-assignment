import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  PatientFormData,
  PartialPatientFormData,
  PatientFormStep,
} from './schemas';

// ============================================================================
// 1. Constants & Types
// ============================================================================

export const DEFAULT_ROOM_ID = 'patient-room';

export const REALTIME_EVENTS = {
  FORM_UPDATE: 'form-update',
  FORM_SUBMIT: 'form-submit',
  FORM_RESET: 'form-reset',
} as const;

export type RealtimeEventType =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

/**
 * Real-time connection states for robust UI status indicators
 */
export type RealtimeConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'FALLBACK_LOCAL';

/**
 * Patient presence states monitored by staff
 */
export type PatientPresenceStatus =
  | 'typing'
  | 'idle'
  | 'submitted'
  | 'offline';

/**
 * Payload sent during keystrokes and step transitions
 */
export interface FormUpdatePayload {
  id: string; // Unique message ID for deduplication
  formData: PartialPatientFormData;
  lastFieldChanged?: string;
  currentStep?: PatientFormStep;
  timestamp: number;
  patientId?: string;
}

/**
 * Payload sent upon final form submission
 */
export interface FormSubmitPayload {
  id: string;
  formData: PatientFormData;
  submittedAt: string;
  patientId?: string;
}

/**
 * Payload sent upon form reset
 */
export interface FormResetPayload {
  id: string;
  timestamp: number;
  patientId?: string;
}

/**
 * Payload tracked for presence status
 */
export interface PatientPresencePayload {
  status: PatientPresenceStatus;
  patientId?: string;
  currentStep?: PatientFormStep;
  lastActiveAt: number;
  updatedAt: number;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  metadata?: Record<string, unknown>;
}

/**
 * Internal message wrapper for BroadcastChannel cross-tab communication
 */
type LocalChannelMessage =
  | {
      type: typeof REALTIME_EVENTS.FORM_UPDATE;
      payload: FormUpdatePayload;
    }
  | {
      type: typeof REALTIME_EVENTS.FORM_SUBMIT;
      payload: FormSubmitPayload;
    }
  | {
      type: typeof REALTIME_EVENTS.FORM_RESET;
      payload: FormResetPayload;
    }
  | {
      type: 'presence-update';
      payload: PatientPresencePayload;
    };

/**
 * Options when subscribing to a real-time patient room
 */
export interface SubscribeRoomOptions {
  roomId?: string;
  isStaff?: boolean;
  patientId?: string;
  onFormUpdate?: (payload: FormUpdatePayload) => void;
  onFormSubmit?: (payload: FormSubmitPayload) => void;
  onFormReset?: (payload: FormResetPayload) => void;
  onPresenceChange?: (
    presence: PatientPresencePayload | null,
    allPresences: Record<string, PatientPresencePayload[]>
  ) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  onError?: (error: Error) => void;
}

export interface BroadcastUpdateOptions {
  lastFieldChanged?: string;
  currentStep?: PatientFormStep;
  patientId?: string;
  roomId?: string;
}

export interface BroadcastSubmitOptions {
  submittedAt?: string;
  patientId?: string;
  roomId?: string;
}

export interface TrackPresenceOptions {
  patientId?: string;
  currentStep?: PatientFormStep;
  roomId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 2. Helper Utilities
// ============================================================================

function generateId(prefix = 'msg'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isOnline(): boolean {
  return isBrowser() ? window.navigator.onLine : true;
}

function getLocalChannelName(roomId: string): string {
  return `agnos_realtime_${roomId}`;
}

// ============================================================================
// 3. RealtimeRoomSession (Channel Manager & Fallback Engine)
// ============================================================================

class RealtimeRoomSession {
  public readonly roomId: string;
  private supabaseChannel: RealtimeChannel | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private connectionStatus: RealtimeConnectionStatus = 'CONNECTING';

  // Subscriptions & callbacks
  private listeners: Set<SubscribeRoomOptions> = new Set();
  private recentMessageIds: Set<string> = new Set();
  private maxHistory = 100;

  // Reconnection state
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;

  // Latest presence cache
  private latestPresence: PatientPresencePayload | null = null;
  private clientKey: string;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.clientKey = generateId('client');
    this.initBroadcastChannel();
    this.initNetworkListeners();
    this.connectSupabase();
  }

  // --- BroadcastChannel Fallback & Local Cross-Tab Sync ---
  private initBroadcastChannel(): void {
    if (!isBrowser() || typeof window.BroadcastChannel === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel(getLocalChannelName(this.roomId));
      this.broadcastChannel.onmessage = (event: MessageEvent<LocalChannelMessage>) => {
        this.handleLocalMessage(event.data);
      };
    } catch (err) {
      console.warn('[Realtime] BroadcastChannel init failed:', err);
    }
  }

  private initNetworkListeners(): void {
    if (!isBrowser()) return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    if (this.isDestroyed) return;
    console.info('[Realtime] Browser back online. Resubscribing channel...');
    this.reconnectAttempts = 0;
    this.connectSupabase();
  };

  private handleOffline = (): void => {
    if (this.isDestroyed) return;
    console.warn('[Realtime] Browser offline. Switching to local fallback.');
    this.updateStatus('FALLBACK_LOCAL');
  };

  // --- Supabase Realtime Channel Connection & Resilience ---
  private connectSupabase(): void {
    if (this.isDestroyed) return;

    if (!isOnline() || !isSupabaseConfigured) {
      this.updateStatus('FALLBACK_LOCAL');
      return;
    }

    this.updateStatus('CONNECTING');

    try {
      // Teardown existing channel if any
      if (this.supabaseChannel) {
        supabase.removeChannel(this.supabaseChannel).catch(() => {});
        this.supabaseChannel = null;
      }

      this.supabaseChannel = supabase.channel(this.roomId, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: this.clientKey },
        },
      });

      // 1. Listen for Broadcast Events
      this.supabaseChannel
        .on('broadcast', { event: REALTIME_EVENTS.FORM_UPDATE }, (payload) => {
          this.handleIncomingFormUpdate(payload.payload as FormUpdatePayload);
        })
        .on('broadcast', { event: REALTIME_EVENTS.FORM_SUBMIT }, (payload) => {
          this.handleIncomingFormSubmit(payload.payload as FormSubmitPayload);
        })
        .on('broadcast', { event: REALTIME_EVENTS.FORM_RESET }, (payload) => {
          this.handleIncomingFormReset(payload.payload as FormResetPayload);
        });

      // 2. Listen for Presence Updates
      this.supabaseChannel
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'join' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'leave' }, () => {
          this.handlePresenceSync();
        });

      // 3. Subscribe with Status Tracking & Auto-reconnection
      this.supabaseChannel.subscribe((status, err) => {
        if (this.isDestroyed) return;

        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
          this.updateStatus('CONNECTED');
        } else if (status === 'CLOSED') {
          this.updateStatus('DISCONNECTED');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Realtime] Channel ${status}:`, err);
          this.updateStatus(this.broadcastChannel ? 'FALLBACK_LOCAL' : 'ERROR');
          this.scheduleReconnect();
        }
      });
    } catch (err) {
      console.error('[Realtime] Unexpected connection error:', err);
      this.updateStatus(this.broadcastChannel ? 'FALLBACK_LOCAL' : 'ERROR');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectTimer) return;

    this.reconnectAttempts += 1;
    // Exponential backoff capped at 10 seconds
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 500, 10000);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isDestroyed && isOnline()) {
        console.info(`[Realtime] Retrying connection (attempt #${this.reconnectAttempts})...`);
        this.connectSupabase();
      }
    }, delay);
  }

  // --- Message Deduplication & Dispatching ---
  private shouldProcessMessage(id: string): boolean {
    if (!id || this.recentMessageIds.has(id)) {
      return false;
    }
    this.recentMessageIds.add(id);

    // Keep cache bounded
    if (this.recentMessageIds.size > this.maxHistory) {
      const oldest = this.recentMessageIds.values().next().value;
      if (oldest) this.recentMessageIds.delete(oldest);
    }
    return true;
  }

  private handleIncomingFormUpdate(payload: FormUpdatePayload): void {
    if (!payload || !this.shouldProcessMessage(payload.id)) return;
    this.listeners.forEach((listener) => {
      try {
        listener.onFormUpdate?.(payload);
      } catch (e) {
        console.error('[Realtime] Listener onFormUpdate error:', e);
      }
    });
  }

  private handleIncomingFormSubmit(payload: FormSubmitPayload): void {
    if (!payload || !this.shouldProcessMessage(payload.id)) return;
    this.listeners.forEach((listener) => {
      try {
        listener.onFormSubmit?.(payload);
      } catch (e) {
        console.error('[Realtime] Listener onFormSubmit error:', e);
      }
    });
  }

  private handleIncomingFormReset(payload: FormResetPayload): void {
    if (!payload || !this.shouldProcessMessage(payload.id)) return;
    this.listeners.forEach((listener) => {
      try {
        listener.onFormReset?.(payload);
      } catch (e) {
        console.error('[Realtime] Listener onFormReset error:', e);
      }
    });
  }

  private handlePresenceSync(): void {
    if (!this.supabaseChannel) return;

    const state = this.supabaseChannel.presenceState<PatientPresencePayload>();
    let latest: PatientPresencePayload | null = null;

    // Find the newest patient presence payload across all presences
    Object.values(state).forEach((presences) => {
      presences.forEach((p) => {
        if (!latest || (p.updatedAt && p.updatedAt > (latest.updatedAt || 0))) {
          latest = p;
        }
      });
    });

    if (latest) {
      this.latestPresence = latest;
    }

    this.listeners.forEach((listener) => {
      try {
        listener.onPresenceChange?.(this.latestPresence, state);
      } catch (e) {
        console.error('[Realtime] Listener onPresenceChange error:', e);
      }
    });
  }

  private handleLocalMessage(msg: LocalChannelMessage): void {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case REALTIME_EVENTS.FORM_UPDATE:
        this.handleIncomingFormUpdate(msg.payload);
        break;
      case REALTIME_EVENTS.FORM_SUBMIT:
        this.handleIncomingFormSubmit(msg.payload);
        break;
      case REALTIME_EVENTS.FORM_RESET:
        this.handleIncomingFormReset(msg.payload);
        break;
      case 'presence-update':
        this.latestPresence = msg.payload;
        this.listeners.forEach((listener) => {
          try {
            listener.onPresenceChange?.(this.latestPresence, {
              [this.clientKey]: [msg.payload],
            });
          } catch (e) {
            console.error('[Realtime] Local presence listener error:', e);
          }
        });
        break;
    }
  }

  private updateStatus(newStatus: RealtimeConnectionStatus): void {
    if (this.connectionStatus === newStatus) return;
    this.connectionStatus = newStatus;
    this.listeners.forEach((listener) => {
      try {
        listener.onStatusChange?.(newStatus);
      } catch (e) {
        console.error('[Realtime] Listener onStatusChange error:', e);
      }
    });
  }

  // --- Public Operations ---

  public getStatus(): RealtimeConnectionStatus {
    return this.connectionStatus;
  }

  public subscribe(options: SubscribeRoomOptions): () => void {
    this.listeners.add(options);

    // Immediately trigger current connection status to the new subscriber
    if (options.onStatusChange) {
      options.onStatusChange(this.connectionStatus);
    }

    // Immediately emit current presence if available
    if (options.onPresenceChange && this.latestPresence) {
      options.onPresenceChange(this.latestPresence, {});
    }

    // Return cleanup unsubscribe function
    return () => {
      this.listeners.delete(options);
    };
  }

  public hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  /**
   * Broadcasts form changes via Supabase Realtime AND Browser BroadcastChannel
   */
  public async broadcastFormUpdate(
    formData: PartialPatientFormData,
    options?: BroadcastUpdateOptions
  ): Promise<boolean> {
    const payload: FormUpdatePayload = {
      id: generateId('upd'),
      formData,
      lastFieldChanged: options?.lastFieldChanged,
      currentStep: options?.currentStep,
      timestamp: Date.now(),
      patientId: options?.patientId,
    };

    // 1. Send via local BroadcastChannel (instant zero-latency cross-tab sync)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: REALTIME_EVENTS.FORM_UPDATE,
          payload,
        });
      } catch (e) {
        console.warn('[Realtime] BroadcastChannel postMessage failed:', e);
      }
    }

    // 2. Send via Supabase Realtime channel if connected
    if (this.supabaseChannel && this.connectionStatus === 'CONNECTED') {
      try {
        const resp = await this.supabaseChannel.send({
          type: 'broadcast',
          event: REALTIME_EVENTS.FORM_UPDATE,
          payload,
        });
        return resp === 'ok';
      } catch (e) {
        console.warn('[Realtime] Supabase broadcast failed, fell back to local:', e);
      }
    }

    return true;
  }

  /**
   * Broadcasts final submission
   */
  public async broadcastFormSubmit(
    formData: PatientFormData,
    options?: BroadcastSubmitOptions
  ): Promise<boolean> {
    const payload: FormSubmitPayload = {
      id: generateId('sub'),
      formData,
      submittedAt: options?.submittedAt || new Date().toISOString(),
      patientId: options?.patientId,
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: REALTIME_EVENTS.FORM_SUBMIT,
          payload,
        });
      } catch (e) {
        console.warn('[Realtime] BroadcastChannel postMessage failed:', e);
      }
    }

    if (this.supabaseChannel && this.connectionStatus === 'CONNECTED') {
      try {
        const resp = await this.supabaseChannel.send({
          type: 'broadcast',
          event: REALTIME_EVENTS.FORM_SUBMIT,
          payload,
        });
        return resp === 'ok';
      } catch (e) {
        console.warn('[Realtime] Supabase submit broadcast failed:', e);
      }
    }

    return true;
  }

  /**
   * Broadcasts form reset
   */
  public async broadcastFormReset(options?: {
    patientId?: string;
  }): Promise<boolean> {
    const payload: FormResetPayload = {
      id: generateId('rst'),
      timestamp: Date.now(),
      patientId: options?.patientId,
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: REALTIME_EVENTS.FORM_RESET,
          payload,
        });
      } catch (e) {
        console.warn('[Realtime] BroadcastChannel postMessage failed:', e);
      }
    }

    if (this.supabaseChannel && this.connectionStatus === 'CONNECTED') {
      try {
        const resp = await this.supabaseChannel.send({
          type: 'broadcast',
          event: REALTIME_EVENTS.FORM_RESET,
          payload,
        });
        return resp === 'ok';
      } catch (e) {
        console.warn('[Realtime] Supabase reset broadcast failed:', e);
      }
    }

    return true;
  }

  /**
   * Tracks patient presence status
   */
  public async trackPresence(
    status: PatientPresenceStatus,
    options?: TrackPresenceOptions
  ): Promise<boolean> {
    const payload: PatientPresencePayload = {
      status,
      patientId: options?.patientId,
      currentStep: options?.currentStep,
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
      metadata: options?.metadata,
    };

    this.latestPresence = payload;

    // 1. Broadcast locally
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'presence-update',
          payload,
        });
      } catch (e) {
        console.warn('[Realtime] Local presence post failed:', e);
      }
    }

    // 2. Track on Supabase
    if (this.supabaseChannel && this.connectionStatus === 'CONNECTED') {
      try {
        await this.supabaseChannel.track(payload);
        return true;
      } catch (e) {
        console.warn('[Realtime] Supabase trackPresence failed:', e);
      }
    }

    return true;
  }

  /**
   * Cleanly closes and releases all channel resources
   */
  public async destroy(): Promise<void> {
    this.isDestroyed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (isBrowser()) {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
      this.broadcastChannel = null;
    }

    if (this.supabaseChannel) {
      try {
        await supabase.removeChannel(this.supabaseChannel);
      } catch {}
      this.supabaseChannel = null;
    }

    this.listeners.clear();
    this.recentMessageIds.clear();
    this.updateStatus('DISCONNECTED');
  }
}

// ============================================================================
// 4. Room Session Registry (Pool)
// ============================================================================

const roomSessions = new Map<string, RealtimeRoomSession>();

export function getOrCreateRoomSession(
  roomId: string = DEFAULT_ROOM_ID
): RealtimeRoomSession {
  let session = roomSessions.get(roomId);
  if (!session) {
    session = new RealtimeRoomSession(roomId);
    roomSessions.set(roomId, session);
  }
  return session;
}

// ============================================================================
// 5. Public Helper Functions (Ready for React Hooks in #14 & #15)
// ============================================================================

/**
 * Subscribes to real-time events and presence on a patient room.
 * Returns an unsubscribe callback for easy cleanup in useEffect.
 */
export function subscribeToPatientRoom(options: SubscribeRoomOptions): () => void {
  const roomId = options.roomId || DEFAULT_ROOM_ID;
  const session = getOrCreateRoomSession(roomId);
  const unsubscribeSession = session.subscribe(options);

  return () => {
    unsubscribeSession();
    // If no listeners remain across the application, tear down the room session
    if (!session.hasListeners()) {
      destroyRealtimeRoom(roomId).catch(() => {});
    }
  };
}

/**
 * Broadcasts form updates as the patient types or changes fields.
 */
export function broadcastFormUpdate(
  formData: PartialPatientFormData,
  options?: BroadcastUpdateOptions
): Promise<boolean> {
  const roomId = options?.roomId || DEFAULT_ROOM_ID;
  const session = getOrCreateRoomSession(roomId);
  return session.broadcastFormUpdate(formData, options);
}

/**
 * Broadcasts final form submission to the staff view.
 */
export function broadcastFormSubmit(
  formData: PatientFormData,
  options?: BroadcastSubmitOptions
): Promise<boolean> {
  const roomId = options?.roomId || DEFAULT_ROOM_ID;
  const session = getOrCreateRoomSession(roomId);
  return session.broadcastFormSubmit(formData, options);
}

/**
 * Broadcasts form reset.
 */
export function broadcastFormReset(options?: {
  patientId?: string;
  roomId?: string;
}): Promise<boolean> {
  const roomId = options?.roomId || DEFAULT_ROOM_ID;
  const session = getOrCreateRoomSession(roomId);
  return session.broadcastFormReset(options);
}

/**
 * Updates presence tracking state ('typing' | 'idle' | 'submitted' | 'offline').
 */
export function trackPatientPresence(
  status: PatientPresenceStatus,
  options?: TrackPresenceOptions
): Promise<boolean> {
  const roomId = options?.roomId || DEFAULT_ROOM_ID;
  const session = getOrCreateRoomSession(roomId);
  return session.trackPresence(status, options);
}

/**
 * Retrieves the current connection status of a patient room.
 */
export function getRealtimeConnectionStatus(
  roomId: string = DEFAULT_ROOM_ID
): RealtimeConnectionStatus {
  const session = roomSessions.get(roomId);
  return session ? session.getStatus() : 'DISCONNECTED';
}

/**
 * Explicitly terminates a room session and disconnects channels.
 */
export async function destroyRealtimeRoom(
  roomId: string = DEFAULT_ROOM_ID
): Promise<void> {
  const session = roomSessions.get(roomId);
  if (session) {
    roomSessions.delete(roomId);
    await session.destroy();
  }
}
