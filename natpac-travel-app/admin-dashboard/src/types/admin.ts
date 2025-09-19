export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'viewer';
  organization: string;
  createdAt: string;
}