// LIFF Types
export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'none' | 'square_chat' | 'external';
  userId?: string;
  utouId?: string;
  roomId?: string;
  groupId?: string;
  squareChatId?: string;
}

export interface LiffState {
  isInClient: boolean;
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  context: LiffContext | null;
  error: string | null;
  isInitializing: boolean;
}
