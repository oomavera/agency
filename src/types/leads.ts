export interface Lead {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  service: 'standard' | 'deep';
  created_at?: string;
} 