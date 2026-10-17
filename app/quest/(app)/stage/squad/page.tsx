import { redirect } from "next/navigation";

/** Squad Up was renamed Padi Up. Kept so old links still work. */
export default function Moved() {
  redirect("/quest/stage/padiup");
}
