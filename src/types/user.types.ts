export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  is_active: boolean;
  jobTitle?: string;
  resume?: string;
  phoneNumber?: string;
  city?: string;
  role: 'user' | 'admin' | 'owner';
  created_at: Date;
  updated_at: Date;
}
