import type { ReactNode } from 'react';

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  disabled?: boolean;
  loading?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: ModalAction[];
  actionAlignment?: 'start' | 'center' | 'end'; 
  preventCloseOnOutsideClick?: boolean;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children, 
  size = 'md', 
  actions = [], 
  actionAlignment = 'end', 
  preventCloseOnOutsideClick = false 
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  const buttonVariants = {
    primary: 'bg-customGray-light text-white hover:bg-black',
    secondary: 'bg-primary/50 text-content-primary hover:bg-primary',
    danger: 'bg-semantic-error text-white hover:bg-red-700',
    success: 'bg-semantic-success text-white hover:bg-green-700',
    ghost: 'bg-surface border-2 border-divider text-content-secondary hover:border-customGray-light hover:text-customGray-light',
  };

  return (
    // PERBAIKAN: Tambahkan print:hidden di container paling luar
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={preventCloseOnOutsideClick ? undefined : onClose} />
      
      <div className={`${sizeClasses[size]} w-full bg-surface rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}>
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-divider flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl md:text-3xl">{icon}</div>}
            <h3 className="text-lg md:text-xl font-bold text-content-primary">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-semantic-error/10 hover:text-semantic-error rounded-full transition-colors text-content-secondary">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1 no-scrollbar">{children}</div>

        {actions.length > 0 && (
          <div className={`px-6 md:px-8 py-5 border-t border-divider flex ${alignmentClasses[actionAlignment]} gap-3 shrink-0 bg-background/30`}>
            {actions.map((action, idx) => {
              const isDisabled = action.disabled || action.loading;
              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={isDisabled}
                  className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${buttonVariants[action.variant || 'primary']} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
                >
                  {action.loading && (
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};