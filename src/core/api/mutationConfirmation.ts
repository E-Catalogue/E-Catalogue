export interface TransportConfirmationRequest {
  title: string;
  message: string;
  confirmLabel: string;
}

type Handler = (request: TransportConfirmationRequest) => Promise<boolean>;

let handler: Handler | null = null;
let leaseExpiresAt = 0;
let leaseCount = 0;
let confirmationPending = false;

export const registerTransportConfirmation = (next: Handler | null) => {
  handler = next;
};

/** Izin sekali pakai dari ConfirmDialog kontekstual untuk request mutation berikutnya. */
export const grantMutationConfirmationLease = () => {
  leaseCount = 1;
  leaseExpiresAt = Date.now() + 10_000;
};

export const consumeMutationConfirmationLease = () => {
  if (leaseCount < 1 || Date.now() > leaseExpiresAt) {
    leaseCount = 0;
    return false;
  }
  leaseCount -= 1;
  return true;
};

export const requestTransportConfirmation = async (request: TransportConfirmationRequest) => {
  if (!handler || confirmationPending) return false;
  confirmationPending = true;
  try {
    return await handler(request);
  } finally {
    confirmationPending = false;
  }
};
