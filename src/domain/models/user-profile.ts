export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email?: string | null;
  type?: 'user' | 'admin';
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  owner: { id: number; name: string };
  canInvite: boolean;
}

export interface GroupInvitation {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  group: { id: string; name: string };
  inviter: { id: number; name: string };
}
