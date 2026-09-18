import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  PatientFormData,
  PartialPatientFormData,
  PatientFormStep,
} from './schemas';

// ============================================================================
// 1. Constants & Types (Spec Compliant & Minimal)
// ============================================================================

export const DEFAULT_ROOM_ID = 'patient-room';

export const REALTIME_EVENTS = {
  FORM_UPDATE: 'form-update',
  FORM_SUBMIT: 'form-submit',
} as const;

export type RealtimeEventType =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export type RealtimeConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'FALLBACK_LOCAL';

export type PatientPresenceStatus =
  | 'typing'
  | 'idle'
  | 'submitted'
  | 'offline';

export interface FormUpdatePayload {
  formData: PartialPatientFormData;
  lastFieldChanged?: string;
  currentStep?: PatientFormStep;
  timestamp: number;
  patientId?: string;
}

export interface FormSubmitPayload {
  formData: PatientFormData;
  submittedAt: string;
  patientId?: string;
}

export interface PatientPresencePayload {
  status: PatientPresenceStatus;
  room: string;
  timestamp: number;
  patientId?: string;
  currentStep?: PatientFormStep;
  metadata?: Record<string, unknown>;
}

export interface SubscribeRoomOptions {
  patientId?: string;
  onFormUpdate?: (payload: FormUpdatePayload) => void;
  onFormSubmit?: (payload: FormSubmitPayload) => void;
  onPresenceChange?: (
    presence: PatientPresencePayload | null,
    allPresences: Record<string, PatientPresencePayload[]>
  ) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
}

type LocalMessage =
  | { type: typeof REALTIME_EVENTS.FORM_UPDATE; payload: FormUpdatePayload }
  | { type: typeof REALTIME_EVENTS.FORM_SUBMIT; payload: FormSubmitPayload }
  | { type: 'presence'; payload: PatientPresencePayload };

// ============================================================================
// 2. Single-Room Channel Manager with Local Fallback
// ============================================================================

class PatientRoomManager {
  private channel: RealtimeChannel | null = null;
  private localBroadcast: BroadcastChannel | null = null;
  private status: RealtimeConnectionStatus = 'DISCONNECTED';
  private currentPresence: PatientPresencePayload | null = null;
  private listeners = new Set<SubscribeRoomOptions>();

  constructor() {
    this.initLocalBroadcast();
    this.initNetworkListeners();
    this.connect();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private initLocalBroadcast(): void {
    if (!this.isBrowser() || typeof BroadcastChannel === 'undefined') return;
    try {
      this.localBroadcast = new BroadcastChannel(`agnos_${DEFAULT_ROOM_ID}`);
      this.localBroadcast.onmessage = (event: MessageEvent<LocalMessage>) => {
        const msg = event.data;
        if (!msg) return;
        if (msg.type === REALTIME_EVENTS.FORM_UPDATE) {
          this.emitFormUpdate(msg.payload);
        } else if (msg.type === REALTIME_EVENTS.FORM_SUBMIT) {
          this.emitFormSubmit(msg.payload);
        } else if (msg.type === 'presence') {
          this.currentPresence = msg.payload;
          this.emitPresence(msg.payload, { local: [msg.payload] });
        }
      };
    } catch (e) {
      console.warn('[Realtime] BroadcastChannel init error:', e);
    }
  }

  private initNetworkListeners(): void {
    if (!this.isBrowser()) return;

    window.addEventListener('online', () => {
      console.info('[Realtime] Back online, reconnecting to Supabase...');
      this.connect();
    });

    window.addEventListener('offline', () => {
      console.warn('[Realtime] Offline mode, using local BroadcastChannel.');
      this.setStatus('FALLBACK_LOCAL');
      const offlinePayload: PatientPresencePayload = {
        status: 'offline',
        room: DEFAULT_ROOM_ID,
        timestamp: Date.now(),
      };
      this.currentPresence = offlinePayload;
      this.emitPresence(offlinePayload, {});
    });
  }

  public connect(): void {
    if (!isSupabaseConfigured || (this.isBrowser() && !navigator.onLine)) {
      this.setStatus('FALLBACK_LOCAL');
      return;
    }

    this.setStatus('CONNECTING');

    if (this.channel) {
      supabase.removeChannel(this.channel).catch(() => {});
    }

    this.channel = supabase.channel(DEFAULT_ROOM_ID, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: `patient_${Date.now()}` },
      },
    });

    this.channel
      .on('broadcast', { event: REALTIME_EVENTS.FORM_UPDATE }, (p) =>
        this.emitFormUpdate(p.payload as FormUpdatePayload)
      )
      .on('broadcast', { event: REALTIME_EVENTS.FORM_SUBMIT }, (p) =>
        this.emitFormSubmit(p.payload as FormSubmitPayload)
      )
      .on('presence', { event: 'sync' }, () => this.syncPresence())
      .on('presence', { event: 'leave' }, () => this.syncPresence());

    this.channel.subscribe((subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        this.setStatus('CONNECTED');
      } else if (subStatus === 'CLOSED') {
        this.setStatus('DISCONNECTED');
      } else if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT') {
        this.setStatus(this.localBroadcast ? 'FALLBACK_LOCAL' : 'DISCONNECTED');
      }
    });
  }

  private syncPresence(): void {
    if (!this.channel) return;
    const state = this.channel.presenceState<PatientPresencePayload>();
    const allPresences: PatientPresencePayload[] = Object.values(state).flat();

    if (allPresences.length === 0) {
      this.currentPresence = null;
      this.emitPresence(null, state);
      return;
    }

    // Pick the most recent active presence
    const latest = allPresences.reduce((prev, curr) =>
      curr.timestamp > prev.timestamp ? curr : prev
    );

    this.currentPresence = latest;
    this.emitPresence(latest, state);
  }

  private setStatus(status: RealtimeConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.listeners.forEach((l) => l.onStatusChange?.(status));
  }

  private emitFormUpdate(payload: FormUpdatePayload): void {
    this.listeners.forEach((l) => l.onFormUpdate?.(payload));
  }

  private emitFormSubmit(payload: FormSubmitPayload): void {
    this.listeners.forEach((l) => l.onFormSubmit?.(payload));
  }

  private emitPresence(
    presence: PatientPresencePayload | null,
    all: Record<string, PatientPresencePayload[]>
  ): void {
    this.listeners.forEach((l) => l.onPresenceChange?.(presence, all));
  }

  public getStatus(): RealtimeConnectionStatus {
    return this.status;
  }

  public subscribe(options: SubscribeRoomOptions): () => void {
    this.listeners.add(options);
    options.onStatusChange?.(this.status);
    if (this.currentPresence) {
      options.onPresenceChange?.(this.currentPresence, {});
    }

    return () => {
      this.listeners.delete(options);
    };
  }

  public hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  public async broadcastUpdate(
    formData: PartialPatientFormData,
    lastFieldChanged?: string,
    currentStep?: PatientFormStep,
    patientId?: string
  ): Promise<boolean> {
    const payload: FormUpdatePayload = {
      formData,
      lastFieldChanged,
      currentStep,
      timestamp: Date.now(),
      patientId,
    };

    // Cross-tab fallback
    this.localBroadcast?.postMessage({
      type: REALTIME_EVENTS.FORM_UPDATE,
      payload,
    });

    // Supabase primary
    if (this.channel && this.status === 'CONNECTED') {
      const resp = await this.channel.send({
        type: 'broadcast',
        event: REALTIME_EVENTS.FORM_UPDATE,
        payload,
      });
      return resp === 'ok';
    }

    return true;
  }

  public async broadcastSubmit(
    formData: PatientFormData,
    submittedAt?: string,
    patientId?: string
  ): Promise<boolean> {
    const payload: FormSubmitPayload = {
      formData,
      submittedAt: submittedAt || new Date().toISOString(),
      patientId,
    };

    this.localBroadcast?.postMessage({
      type: REALTIME_EVENTS.FORM_SUBMIT,
      payload,
    });

    if (this.channel && this.status === 'CONNECTED') {
      const resp = await this.channel.send({
        type: 'broadcast',
        event: REALTIME_EVENTS.FORM_SUBMIT,
        payload,
      });
      return resp === 'ok';
    }

    return true;
  }

  public async trackPresence(
    status: PatientPresenceStatus,
    patientId?: string,
    currentStep?: PatientFormStep,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    const payload: PatientPresencePayload = {
      status,
      room: DEFAULT_ROOM_ID,
      timestamp: Date.now(),
      patientId,
      currentStep,
      metadata,
    };

    this.currentPresence = payload;

    this.localBroadcast?.postMessage({
      type: 'presence',
      payload,
    });

    if (this.channel && this.status === 'CONNECTED') {
      await this.channel.track(payload);
    }

    return true;
  }

  public async destroy(): Promise<void> {
    if (this.localBroadcast) {
      this.localBroadcast.close();
      this.localBroadcast = null;
    }

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.listeners.clear();
    this.setStatus('DISCONNECTED');
  }
}

// ============================================================================
// 3. Singleton Instance & Public API
// ============================================================================

let roomManager: PatientRoomManager | null = null;

function getRoomManager(): PatientRoomManager {
  if (!roomManager) {
    roomManager = new PatientRoomManager();
  }
  return roomManager;
}

export function subscribeToPatientRoom(options: SubscribeRoomOptions): () => void {
  const manager = getRoomManager();
  const unsubscribe = manager.subscribe(options);

  return () => {
    unsubscribe();
    if (!manager.hasListeners()) {
      destroyPatientRoom().catch(() => {});
    }
  };
}

export function broadcastFormUpdate(
  formData: PartialPatientFormData,
  options?: {
    lastFieldChanged?: string;
    currentStep?: PatientFormStep;
    patientId?: string;
  }
): Promise<boolean> {
  return getRoomManager().broadcastUpdate(
    formData,
    options?.lastFieldChanged,
    options?.currentStep,
    options?.patientId
  );
}

export function broadcastFormSubmit(
  formData: PatientFormData,
  options?: { submittedAt?: string; patientId?: string }
): Promise<boolean> {
  return getRoomManager().broadcastSubmit(
    formData,
    options?.submittedAt,
    options?.patientId
  );
}

export function trackPatientPresence(
  status: PatientPresenceStatus,
  options?: {
    patientId?: string;
    currentStep?: PatientFormStep;
    metadata?: Record<string, unknown>;
  }
): Promise<boolean> {
  return getRoomManager().trackPresence(
    status,
    options?.patientId,
    options?.currentStep,
    options?.metadata
  );
}

export function getRealtimeConnectionStatus(): RealtimeConnectionStatus {
  return roomManager ? roomManager.getStatus() : 'DISCONNECTED';
}

export async function destroyPatientRoom(): Promise<void> {
  if (roomManager) {
    const manager = roomManager;
    roomManager = null;
    await manager.destroy();
  }
}
