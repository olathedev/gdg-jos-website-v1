/** Missing or invalid filters always start with paid orders. */
export function orderStatusFilter(value?: string | null) {
  return value && ["all", "paid", "pending", "failed", "free"].includes(value) ? value : "paid";
}
