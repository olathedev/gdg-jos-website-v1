import { redirect } from "next/navigation";

/** Replaced by the stage map. Kept so old links and shared URLs still land somewhere. */
export default function Moved() {
  redirect("/quest/home");
}
