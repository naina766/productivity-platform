/** API-safe serialised auth shapes. Dates are ISO strings, not Date objects. */

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiWorkspace {
  id: string;
  name: string;
  role: string;
}

/** The workspace the app scopes itself to after sign-in. */
export interface ApiSession {
  user: ApiUser;
  workspace?: ApiWorkspace;
}
