// Konstanta statis global lintas fitur.

export const APP_NAME = 'Cars Showroom';
export const APP_TAGLINE = 'Used Car Specialist';
export const APP_VERSION = `v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}`;

// Profil user dummy (login di-skip sementara)
export const CURRENT_USER = {
  name: 'Admin Showroom',
  role: 'Administrator',
  initials: 'CS',
  branch: 'Cars Showroom Pusat',
  avatar:
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=256&auto=format&fit=crop',
};

// Gambar fallback unit mobil bila gagal dimuat
export const DEFAULT_CAR_IMAGE =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop';
