import { redirect } from "next/navigation";

/** Short link to every partner (the Partner Link-up stage page lists them all). */
export default function Partners() {
  redirect("/quest/stage/partners");
}
