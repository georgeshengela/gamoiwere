import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      full_name?: string;
      role: string;
    };
  }
}