import "server-only";
import { fulfilPaidOrder } from "./orders";
import { verifyTransaction, type PaystackTransaction } from "./paystack";

/**
 * Verify a reference with Paystack and fulfil the order if paid.
 * Ticket emails are off for now (Resend isn't working): buyers get their
 * tickets on the order page and can download the PDF there.
 */
export async function verifyAndFulfil(reference: string, _site: string, txn?: PaystackTransaction) {
  const verified = txn ?? (await verifyTransaction(reference));
  const { order } = await fulfilPaidOrder(verified);
  return order;
}
