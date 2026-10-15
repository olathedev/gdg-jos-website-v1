import Link from "next/link";
import { signOutAction } from "@/app/quest/actions";
import ProfileForm from "@/components/quest/ProfileForm";
import { requireMe } from "@/lib/quest/auth";

export const metadata = { title: "Build your agent", robots: { index: false } };

export default async function Setup() {
  const me = await requireMe();
  const editing = Boolean(me.onboarded_at);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-5 pb-10 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:pt-10">
      <div className="flex items-center justify-between">
        {editing ? (
          <Link href="/quest/home" className="flex min-h-11 items-center text-sm font-semibold">
            Back
          </Link>
        ) : (
          <form action={signOutAction}>
            <button className="flex min-h-11 items-center text-sm font-semibold">Back</button>
          </form>
        )}
        {editing ? (
          <form action={signOutAction}>
            <button className="min-h-11 rounded-full bg-white px-4 text-xs font-bold">Sign out</button>
          </form>
        ) : (
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold">Step 1 of 2</span>
        )}
      </div>
      <h1 className="type-heading text-[38px] leading-none font-bold lg:text-5xl">
        {editing ? "Your" : "Build your"} <span className="text-g-blue">agent</span>
      </h1>
      <ProfileForm
        initial={{
          id: me.id,
          full_name: me.full_name,
          stack: me.stack,
          github: me.github,
          linkedin: me.linkedin,
          x_handle: me.x_handle,
          instagram: me.instagram,
          whatsapp: me.whatsapp,
          is_adult: me.is_adult,
          listed: me.listed,
          share_whatsapp: me.share_whatsapp,
          onboarded: editing,
        }}
      />
    </main>
  );
}
