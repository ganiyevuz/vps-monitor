export type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};
