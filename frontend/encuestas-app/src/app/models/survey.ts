export interface Survey {
  id: string;
  publicId: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | string;
  isAnonymous?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
