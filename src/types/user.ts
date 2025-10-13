export type User = {
  id: number;
  email: string;
  name?: string;
  role: 'user' | 'admin';
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
