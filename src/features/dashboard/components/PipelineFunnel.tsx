import { PIPELINE, CONVERSION_RATE } from '@/data/mock';
import { useAppSelector } from '@/app/store';

const COLORS = ['bg-primary', 'bg-accent-orange', 'bg-accent-amber', 'bg-accent-green'];
const WIDTHS = ['w-full', 'w-[78%]', 'w-[56%]', 'w-[36%]'];

const STAGE_DETAIL: Record<string, string> = {
  lead: 'Lead',
  test_drive: 'Lead',
  negosiasi: 'Lead',
  spk: 'Deal',
};

export const PipelineFunnel = () => {
  const leads = useAppSelector((s) => s.data.leads);
  return (
    <div>
      <div className="flex flex-col items-center gap-1.5">
        {PIPELINE.map((p, i) => {
          const count = leads.filter((l) => l.stage === p.key).length;
          return (
            <div key={p.key} className="w-full flex items-center gap-4">
              <div className={`${WIDTHS[i]} mx-auto`}>
                <div className={`${COLORS[i]} rounded-lg h-11 flex items-center justify-center text-white font-extrabold text-lg shadow-sm`}>
                  {p.count}
                </div>
              </div>
              <div className="w-[120px] shrink-0">
                <p className="text-[12px] font-bold text-ink leading-none">{p.stage}</p>
                <p className="text-[10px] text-muted font-semibold mt-1">{count} {STAGE_DETAIL[p.key]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-divider">
        <span className="text-[12px] font-bold text-muted">Konversi Deal</span>
        <span className="text-lg font-extrabold text-primary">{CONVERSION_RATE}%</span>
      </div>
    </div>
  );
};
