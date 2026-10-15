import Nav from "@/components/quest/Nav";
import { requireAgent } from "@/lib/quest/auth";
import { crew } from "@/lib/quest/game";
import { myScore } from "@/lib/quest/points";
import { displayName, initials } from "@/lib/quest/validate";

export const metadata = { robots: { index: false } };

/** Signed-in screens: bottom pill bar on phones, sidebar from lg up. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAgent();
  const [{ score }, { pending }] = await Promise.all([myScore(me.id), crew(me.id)]);
  return (
    <div className="lg:flex">
      <Nav
        me={{
          id: me.id,
          name: displayName(me.full_name, me.is_adult),
          initials: initials(me.full_name),
          score,
          pending: pending.length,
        }}
      />
      <main className="mx-auto w-full max-w-md px-5 pt-5 pb-32 sm:max-w-2xl lg:max-w-5xl lg:px-10 lg:pt-10 lg:pb-16">
        {children}
      </main>
    </div>
  );
}
