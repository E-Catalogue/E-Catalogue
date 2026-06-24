import { useEffect, useState } from 'react';

// Menunda update sebuah nilai sampai tidak ada perubahan selama `delay` ms.
// Berguna untuk input pencarian agar tidak memanggil API di tiap ketikan.
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
