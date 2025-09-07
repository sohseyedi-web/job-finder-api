export type Role = 'USER' | 'OWNER' | 'ADMIN' | 'EMPLOYEE';

export interface IProfile {
  id: string;
  userId: string;
  city?: string | null;
  phoneNumber?: string | null;

  // USER
  jobTitle?: string | null;
  resumeUrl?: string | null;

  // OWNER
  companyName?: string | null;
  companyCity?: string | null;
  address?: string | null;
  companyPhone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  ownerPhone?: string | null;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  profile?: IProfile | null;
}
