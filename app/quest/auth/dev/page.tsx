import { notFound } from "next/navigation";
import { devLoginAction } from "@/app/quest/actions";
import { input, Logo, pillDark } from "@/components/quest/ui";
import { devLoginEnabled } from "@/lib/quest/session";

/** Local testing only: sign in as any email, so two browsers can play against each other. */
export default async function DevLogin({ searchParams }: PageProps<"/quest/auth/dev">) {
  if (!devLoginEnabled()) notFound();
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <Logo />
      <h1 className="type-heading text-2xl font-bold">Dev sign-in</h1>
      <p className="text-sm text-ink/70">Google sign-in isn&apos;t configured. This page only exists in development.</p>
      <form action={devLoginAction} className="flex flex-col gap-3">
        <input type="hidden" name="ref" value={String(sp.ref ?? "")} />
        <input type="hidden" name="next" value={String(sp.next ?? "")} />
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Email
          <input name="email" type="email" required className={input} placeholder="ada@example.com" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Name
          <input name="name" className={input} placeholder="Ada Okafor" />
        </label>
        {sp.error && <p className="text-sm text-g-red">Enter a valid email.</p>}
        <button className={pillDark}>Sign in</button>
      </form>
    </main>
  );
}
