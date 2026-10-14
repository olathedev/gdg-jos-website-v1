/** Default, legacy "all", and invalid filters show paid orders only. */
export function orderStatusFilter(value?: string | null) {
  return value && ["paid", "pending", "failed", "free"].includes(value) ? value : "paid";
}
