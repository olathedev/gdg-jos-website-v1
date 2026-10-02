import "server-only";
import { sendTicketEmails } from "./email";
import { fulfilPaidOrder, getOrder, markEmailed } from "./orders";
import { verifyTransaction, type PaystackTransaction } from "./paystack";

/** Verify a reference with Paystack, fulfil the order if paid, and email tickets once. */
export async function verifyAndFulfil(reference: string, site: string, txn?: PaystackTransaction) {
  const verified = txn ?? (await verifyTransaction(reference));
  const { order, fresh } = await fulfilPaidOrder(verified);
  if (order && fresh) {
    const full = await getOrder(order.reference);
    if (full && (await sendTicketEmails(full.order, full.tickets, site))) await markEmailed(order.id);
  }
  return order;
}
