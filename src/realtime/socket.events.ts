export const SOCKET_EVENTS = {
  USER_REGISTERED: "user:registered",
  USER_LOGGED_IN: "user:logged_in",
} as const;

export interface UserEventPayload {
  userId: string;
  email: string;
  name: string;
}
