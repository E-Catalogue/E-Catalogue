import { useState } from 'react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/auth.api';
import { LoginRequestSchema, type LoginRequest } from '../schema';
import { setCredentials } from '@/app/store/authSlice';

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<LoginRequest>({ 
    email: '', 
    password: '',
    deviceInfo: 'Web Browser POS'
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 1. Simpan data ke Redux & LocalStorage
        dispatch(setCredentials(response.data));
        
        // 2. PERBAIKAN: Gunakan setTimeout untuk menunggu React selesai 
        // me-render context terbaru ke RouterProvider sebelum berpindah halaman.
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 50); // Jeda 50ms sudah cukup untuk membiarkan siklus render selesai
      }
    },
    onError: (error: any) => {
      // Tangkap error dari backend atau dari Axios
      if (!error.response) {
         setValidationError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else if (error.response?.data?.message) {
         setValidationError(error.response.data.message);
      } else if (error.response?.status === 401) {
         setValidationError('Email atau Password salah.');
      } else {
         setValidationError('Terjadi kesalahan saat masuk.');
      }
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      LoginRequestSchema.parse(formData);
      loginMutation.mutate(formData);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setValidationError(err.issues[0].message);
      }
    }
  };

  return {
    formData,
    isLoading: loginMutation.isPending,
    error: validationError, 
    handleChange,
    handleLogin
  };
};