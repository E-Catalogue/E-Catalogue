/**
 * Bentuk permission yang dipakai lintas modul tenant (role, menu).
 * Sesuai PRD: permission adalah child eksplisit dari sebuah module (`moduleId`).
 */
export interface MenuPermissionItem {
  id: string;
  moduleId: string;
  code: string;
  name: string;
  action: string;
  scope: 'PLATFORM' | 'TENANT' | 'BOTH';
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
