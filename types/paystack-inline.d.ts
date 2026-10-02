declare module "@paystack/inline-js" {
  type Callbacks = {
    onSuccess?: (t: { id: number; reference: string; message: string }) => void;
    onCancel?: () => void;
    onError?: (e: { message: string }) => void;
    onLoad?: (t: { id: number; accessCode: string }) => void;
  };
  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: Callbacks): unknown;
  }
}
