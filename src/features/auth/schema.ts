import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  deviceInfo: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable().optional(),
});

export const StaffProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
});

export const LoginResponseDataSchema = z.object({
  tokenType: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  user: UserSchema,
  staffProfile: StaffProfileSchema,
  role: z.any(),
  branch: z.any(),
  access_menu: z.array(z.any()).optional(),
});

export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;