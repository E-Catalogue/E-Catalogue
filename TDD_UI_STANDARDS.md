# Test-Data Driven UI (TDD UI) Standard

Konsep **Test-Data Driven UI** (TDD UI) digunakan untuk mempercepat pengembangan antarmuka (UI) dengan cara memasok *Mock Data* (Data Dummy) yang terstruktur sesuai dengan antarmuka TypeScript API yang diharapkan, sebelum API *backend* benar-benar selesai.

Pendekatan ini memungkinkan Frontend Developer untuk:
1. Memvalidasi skema/desain UI komponen yang kompleks (seperti DataTable, interaksi tabel, paginasi).
2. Memastikan seluruh filter, pengurutan, dan paginasi *client-side* bisa dijalankan.
3. Menghindari *blocker* akibat *endpoints* API yang masih berstatus *work-in-progress* di sisi Backend.

## Aturan Pembuatan Mock Data

1. **Letakkan Mock Data di file yang relevan (atau di folder terpisah jika panjang).**
   Gunakan fungsi `useQuery` dengan memberikan *initialData* atau *queryFn* yang me-return janjinya (*Promise*) dari *mock data* (jika API belum ada).
2. **Struktur data harus 100% mematuhi *Interface* API yang telah disepakati di PRD.**
3. **Simulasikan Jeda Jaringan (Network Latency).** (Opsional tapi disarankan)
   Gunakan `setTimeout` saat mereturn *mock data* agar *loader* atau *skeleton* UI bisa terlihat.

## Contoh Penerapan dengan React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import type { PlatformTenant } from '@/features/platform/api/platform-tenants.api';

// 1. Definisikan Data Dummy
const MOCK_TENANTS: PlatformTenant[] = [
  { id: '1', code: 'T001', name: 'Tenant Alpha', isActive: true },
  { id: '2', code: 'T002', name: 'Tenant Beta', isActive: false },
];

// 2. Buat fungsi pemanggil tiruan (Mock Fetcher)
const fetchMockTenants = async (): Promise<PlatformTenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_TENANTS), 600); // Simulasi delay 600ms
  });
};

export const TenantListPage = () => {
  const [search, setSearch] = useState('');
  
  // 3. Gunakan useQuery, jika endpoint belum siap gunakan mock fetcher
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['platform-tenants'],
    queryFn: fetchMockTenants, // Nanti cukup diganti menjadi: tenantApi.getAll
  });

  const filtered = useMemo(() => 
    tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())), 
  [tenants, search]);

  return (
    <div>
      {/* Implementasi UI dengan `filtered` */}
    </div>
  );
};
```

Saat Endpoint Backend siap, pengembang hanya perlu menukar `queryFn: fetchMockTenants` menjadi fungsi Axios/API resmi (misal: `queryFn: platformTenantsApi.getTenants`), dan UI akan otomatis mengonsumsi data *live* tanpa perubahan komponen.
