interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
}

export const Alert = ({ type, message, isVisible }: AlertProps) => {
  if (!isVisible) return null;

  const styles = {
    success: 'bg-semantic-success text-white shadow-semantic-success/20',
    error: 'bg-semantic-error text-white shadow-semantic-error/20',
    warning: 'bg-semantic-warning text-black shadow-semantic-warning/20',
    info: 'bg-semantic-info text-white shadow-semantic-info/20',
  };

  return (
    <div className={`fixed top-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-500 ${styles[type]}`}>
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};