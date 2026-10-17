import { ArrowLeft, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import RemovePhotoButton from "@/components/quest/RemovePhotoButton";
import RoleBadge, { roleRing } from "@/components/quest/RoleBadge";
import RoleControl from "@/components/quest/RoleControl";
import { GameAvatar, panel } from "@/components/quest/ui";
import { isOwnerEmail } from "@/lib/admin/auth";
import { getMe } from "@/lib/quest/auth";
import { circleStats, type MemberQuery, members, PAGE_SIZE, roleHistory } from "@/lib/quest/circle-admin";
import { type Circle, getCircle, isPlatformAdmin, roleOf } from "@/lib/quest/circles";
import { assignableRoles, isStaff, ROLES, roleLabel, type Role } from "@/lib/quest/roles";
import { db } from "@/lib/tickets/db";

export const metadata: Metadata = { title: "Circle admin" };

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
const fmt = new Intl.NumberFormat("en-NG");
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CircleAdmin({ params, searchParams }: PageProps<"/c/[slug]/admin">) {
  const { slug } = await params;
  const here = `/c/${slug}/admin`;
  const me = await getMe();
  if (!me) redirect(`/quest?next=${encodeURIComponent(here)}`);
  if (!me.onboarded_at) redirect(`/quest/setup?next=${encodeURIComponent(here)}`);
  const circle = await getCircle(slug);
  if (!circle) notFound();
  const role = await roleOf(circle.id, me);

  if (!isStaff(role)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="type-heading text-2xl font-bold">You&apos;re not allowed here</h1>
        <p className="text-sm text-fg/65">Circle admin is for organisers and co-organisers of {circle.name}.</p>
        <Link href="/quest/home" className="text-sm font-bold text-hl underline">
          Back to PadiUp
        </Link>
      </main>
    );
  }

  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === one(sp.tab)) ? (one(sp.tab) as Tab) : "overview";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 pt-4 pb-16">
      <Link href="/quest/home" className="flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-fg/60 hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" /> PadiUp
      </Link>
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-bold tracking-[0.2em] text-fg/50">CIRCLE ADMIN</p>
        <h1 className="type-heading text-[28px] leading-tight font-bold">{circle.name}</h1>
        <RoleBadge role={role} circle={circle.name} />
      </header>

      <nav aria-label="Circle admin" className="-mx-4 flex gap-1 overflow-x-auto px-4">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`${here}?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold ${
              tab === t.id ? "bg-fg text-on-fg" : "text-fg/65 hover:text-fg"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "overview" && <Overview circle={circle} platform={await isPlatformAdmin(me)} />}
      {tab === "people" && <People circle={circle} me={me} actorRole={role} sp={sp} here={here} />}
    </main>
  );
}

/* ---------- Overview ---------- */

async function Overview({ circle, platform }: { circle: Circle; platform: boolean }) {
  const s = await circleStats(circle);
  const pct = s.members ? Math.round((s.complete / s.members) * 100) : 0;
  const notComplete = s.members - s.complete;
  const max = Math.max(1, ...s.byHour);
  const tiles = [
    { label: "Members of this circle", value: fmt.format(s.members), sub: `${fmt.format(s.joinedToday)} joined today` },
    { label: "Completed profiles", value: `${fmt.format(s.complete)}`, sub: `${pct}% have a name, a stack and a social` },
    { label: "Not yet complete", value: fmt.format(notComplete), sub: "Remind them on stage to add a stack and a social" },
    { label: "Active now", value: fmt.format(s.activeNow), sub: `${fmt.format(s.activeToday)} active today` },
    { label: "Padi connections", value: fmt.format(s.connections), sub: "Accepted padi pairs" },
    { label: "Points awarded", value: fmt.format(s.points), sub: "Across every player" },
  ];
  return (
    <div className="flex flex-col gap-5">
      {platform && (
        <section className={`${panel} flex items-center justify-between gap-3 p-4`}>
          <span className="text-sm font-bold">Total sign-ups on PadiUp</span>
          <span className="type-heading text-2xl font-bold tabular-nums">{fmt.format(s.platformTotal)}</span>
        </section>
      )}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className={`${panel} flex flex-col gap-1 p-4`}>
            <dt className="text-xs font-bold text-fg/60">{t.label}</dt>
            <dd className="type-heading text-[28px] leading-none font-bold tabular-nums">{t.value}</dd>
            <dd className="text-xs text-fg/50">{t.sub}</dd>
          </div>
        ))}
      </dl>
      <section className={`${panel} flex flex-col gap-3 p-4`} aria-labelledby="hours-h">
        <h2 id="hours-h" className="text-sm font-bold">
          Sign-ups by hour today
        </h2>
        <ol className="flex flex-col gap-1.5">
          {s.byHour.map((n, h) =>
            n || (h >= 7 && h <= 20) ? (
              <li key={h} className="flex items-center gap-2 text-xs">
                <span className="w-11 shrink-0 tabular-nums text-fg/55">{String(h).padStart(2, "0")}:00</span>
                <span className="h-3 rounded-full bg-h-yellow" style={{ width: `${Math.max(n ? 4 : 0, (n / max) * 100)}%` }} aria-hidden />
                <span className="tabular-nums font-bold">{n}</span>
              </li>
            ) : null,
          )}
        </ol>
        <p className="text-xs text-fg/50">Numbers refresh every minute.</p>
      </section>
    </div>
  );
}

/* ---------- People ---------- */

async function People({
  circle,
  me,
  actorRole,
  sp,
  here,
}: {
  circle: Circle;
  me: { id: string; email: string };
  actorRole: Role;
  sp: Record<string, string | string[] | undefined>;
  here: string;
}) {
  const f: MemberQuery = {
    q: one(sp.q),
    role: (ROLES as readonly string[]).includes(one(sp.role)) ? (one(sp.role) as Role) : "all",
    complete: one(sp.complete) === "yes" || one(sp.complete) === "no" ? (one(sp.complete) as "yes" | "no") : "all",
    sort: one(sp.sort) === "points" || one(sp.sort) === "active" ? (one(sp.sort) as "points" | "active") : "joined",
    page: Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1),
  };
  const [{ list, total }, history] = await Promise.all([members(circle, f), roleHistory(circle)]);
  // ADMIN_USERS owners are organisers set on the server; their role can't be changed here.
  const ownerIds = new Set(
    (await db()<{ id: string; email: string }[]>`select id, email from quest_profiles where id = any(${list.map((m) => m.id)})`)
      .filter((p) => isOwnerEmail(p.email))
      .map((p) => p.id),
  );
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (patch: Partial<Record<keyof MemberQuery, string>>) => {
    const q = new URLSearchParams({ tab: "people" });
    const merged = { q: f.q, role: f.role, complete: f.complete, sort: f.sort, page: "1", ...patch };
    for (const [k, v] of Object.entries(merged)) if (v && v !== "all" && !(k === "page" && v === "1") && !(k === "sort" && v === "joined")) q.set(k, v);
    return `${here}?${q}`;
  };
  const chip = (on: boolean) =>
    `flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-bold ${on ? "border-fg bg-fg text-on-fg" : "border-fg/[0.12] bg-surface text-fg/75"}`;

  return (
    <div className="flex flex-col gap-4">
      <p className="type-heading text-xl font-bold">
        {fmt.format(total)} {total === 1 ? "member" : "members"}
        {(f.q || f.role !== "all" || f.complete !== "all") && <span className="text-fg/45"> match</span>}
      </p>

      <form action={here} className="flex gap-2">
        <input type="hidden" name="tab" value="people" />
        {f.role !== "all" && <input type="hidden" name="role" value={f.role} />}
        {f.complete !== "all" && <input type="hidden" name="complete" value={f.complete} />}
        {f.sort !== "joined" && <input type="hidden" name="sort" value={f.sort} />}
        <label className="flex h-12 min-w-0 flex-1 items-center rounded-full border border-fg/[0.12] bg-surface px-4 focus-within:border-h-yellow">
          <span className="sr-only">Search members by name</span>
          <input name="q" type="search" defaultValue={f.q} placeholder="Search by name" className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg/35" />
        </label>
        <button type="submit" className="min-h-12 rounded-full bg-fg px-5 text-sm font-bold text-on-fg">
          Search
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by role">
          {(["all", ...ROLES] as const).map((r) => (
            <Link key={r} href={link({ role: r })} aria-current={f.role === r ? "true" : undefined} className={chip(f.role === r)}>
              {r === "all" ? "All roles" : roleLabel(r)}
            </Link>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter and sort">
          {(
            [
              ["all", "Any profile"],
              ["yes", "Complete"],
              ["no", "Not complete"],
            ] as const
          ).map(([v, l]) => (
            <Link key={v} href={link({ complete: v })} aria-current={f.complete === v ? "true" : undefined} className={chip(f.complete === v)}>
              {l}
            </Link>
          ))}
          <span aria-hidden className="mx-1 w-px shrink-0 bg-fg/15" />
          {(
            [
              ["joined", "Newest"],
              ["points", "Points"],
              ["active", "Last active"],
            ] as const
          ).map(([v, l]) => (
            <Link key={v} href={link({ sort: v })} aria-current={f.sort === v ? "true" : undefined} className={chip(f.sort === v)}>
              Sort: {l}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className={`${panel} px-5 py-10 text-center text-sm text-fg/60`}>No members match.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {list.map((m) => {
            const staffRole = m.role === "attendee" ? null : m.role;
            const locked = m.id === me.id ? "That's you" : ownerIds.has(m.id) ? "Set on the server" : undefined;
            return (
              <li key={m.id} className={`${panel} flex flex-col gap-3 p-3.5`}>
                <div className="flex items-start gap-3">
                  <GameAvatar avatar={m.avatar} initials={m.initials} size={48} ring={roleRing(staffRole)} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-base font-bold">{m.name}</span>
                      {staffRole && <RoleBadge role={staffRole} circle={circle.name} />}
                    </span>
                    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-fg/60">
                      <span>Joined {when.format(new Date(m.joined))}</span>
                      <span className="tabular-nums">{fmt.format(m.points)} pts</span>
                      <span>{m.lastActive ? `Active ${when.format(new Date(m.lastActive))}` : "Not active yet"}</span>
                      <span className={`flex items-center gap-1 font-bold ${m.complete ? "text-good" : "text-fg/50"}`}>
                        {m.complete ? <Check aria-hidden className="size-3" strokeWidth={3} /> : <X aria-hidden className="size-3" strokeWidth={3} />}
                        {m.complete ? "Profile complete" : "Profile not complete"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-3">
                  <RoleControl
                    slug={circle.slug}
                    userId={m.id}
                    name={m.name === "Under-18 member" ? "this member" : m.name}
                    current={m.role}
                    options={assignableRoles(actorRole, m.role)}
                    locked={locked}
                  />
                  {m.hasPhoto && <RemovePhotoButton slug={circle.slug} userId={m.id} name={m.name} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-sm font-bold">
          {f.page > 1 ? <Link href={link({ page: String(f.page - 1) })} className="min-h-11 content-center text-hl">← Previous</Link> : <span />}
          <span className="text-fg/55">
            Page {f.page} of {pages}
          </span>
          {f.page < pages ? <Link href={link({ page: String(f.page + 1) })} className="min-h-11 content-center text-hl">Next →</Link> : <span />}
        </nav>
      )}

      <section className="flex flex-col gap-2 pt-4" aria-labelledby="history-h">
        <h2 id="history-h" className="text-[11px] font-bold tracking-[0.2em] text-fg/50">
          ROLE CHANGES
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-fg/55">No role changes yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap gap-x-2 text-fg/80">
                <span className="text-fg/50 tabular-nums">{when.format(new Date(h.at))}</span>
                <span>
                  <b>{h.target}</b>: {roleLabel(h.oldRole as Role)} → {roleLabel(h.newRole as Role)}
                  <span className="text-fg/55"> {h.viaLink ? "via invite link" : `by ${h.actor}`}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
