export const ActiveBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
    {active ? 'Aktif' : 'Nonaktif'}
  </span>
);
