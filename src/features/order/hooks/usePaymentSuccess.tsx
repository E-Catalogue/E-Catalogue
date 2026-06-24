export const usePaymentSuccess = (
grandTotal: number, onResetOrder: () => void) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewOrder = () => {
    onResetOrder();
  };

  return {
    handlePrint,
    handleCreateNewOrder
  };
};