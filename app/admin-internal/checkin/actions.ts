"use server";

import { requireStaff } from "@/lib/admin/auth";
import { checkInByCode, type CheckinResult, searchTickets, undoCheckIn } from "@/lib/admin/checkin";

// Door actions. Any team member (volunteers included) may use these; nothing here exposes money.

export async function checkInCodeAction(code: string): Promise<CheckinResult> {
  const me = await requireStaff();
  return checkInByCode(String(code ?? "").slice(0, 80), me.email);
}

export async function undoCheckInAction(id: string) {
  await requireStaff();
  if (!/^[0-9a-f-]{36}$/.test(String(id))) return;
  await undoCheckIn(id);
}

export async function searchTicketsAction(q: string) {
  await requireStaff();
  return searchTickets(String(q ?? "").slice(0, 80));
}
