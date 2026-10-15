"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import { communityAction, followAction, xPostAction, type Result } from "@/app/quest/actions";
import { COMMUNITY_JOIN_URL, FOLLOWS, HASHTAGS, LIMITS, POINTS, X_MENTION } from "@/lib/quest/config";
import { pillDark, SectionLabel } from "./ui";

type Props = {
  followed: string[];
  community: string | null;
  postsToday: number;
  pendingPosts: number;
  hasX: boolean;
};

const btn = "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors";
const tweetText = `I'm coming to DevFest Jos on 17 Oct! ${HASHTAGS.join(" ")} ${X_MENTION}`;

export default function Missions({ followed, community, postsToday, pendingPosts, hasX }: Props) {
  const [, start] = useTransition();
  const [optFollowed, addFollowed] = useOptimistic(followed, (cur, id: string) => [...cur, id]);
  const [optCommunity, setCommunity] = useOptimistic(community, (_c, v: string) => v);
  const [post, postAction, posting] = useActionState<Result, FormData>(xPostAction, null);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <section className="flex flex-col gap-3">
        <SectionLabel color="bg-g-blue">Follow GDG Jos · +{POINTS.follow} each</SectionLabel>
        <ul className="rounded-3xl bg-white px-[18px] py-1.5">
          {FOLLOWS.map((f, i) => {
            const done = optFollowed.includes(f.id);
            return (
              <li key={f.id} className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-[#EDEDED]" : ""}`}>
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
                  style={{ background: f.tint }}
                >
                  {f.short}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-bold">{f.name}</span>
                  <span className="truncate text-[13px] text-[#5F5F5F]">{f.handle}</span>
                </span>
                {done ? (
                  <span className={`${btn} flex items-center bg-p-green`}>Followed</span>
                ) : (
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      start(async () => {
                        addFollowed(f.id);
                        await followAction(f.id);
                      })
                    }
                    className={`${btn} flex items-center bg-ink text-white hover:bg-ink/85`}
                  >
                    Follow +{POINTS.follow}
                    <span className="sr-only"> GDG Jos on {f.name} (opens in a new tab)</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
          These apps don&apos;t let anyone see who follows a page, so follow points are checked by hand for prize winners.
          Unfollowing after the event is fine; claiming without following is not.
        </p>

        <SectionLabel color="bg-g-green">Join the community · +{POINTS.community}</SectionLabel>
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-[24px_64px_24px_24px] bg-p-green p-5">
          <span aria-hidden className="absolute top-3 right-5 text-5xl leading-none font-bold text-g-green">
            {"{ }"}
          </span>
          <span className="type-heading text-xl font-bold">GDG Jos on GDG Community</span>
          <span className="text-sm leading-normal text-[#1E3A24]">
            Join with the same email you used here. We match it against the member list.
          </span>
          {optCommunity ? (
            <span className="self-start rounded-full bg-white px-5 py-3 text-[15px] font-bold">
              {optCommunity === "matched" ? `Joined · +${POINTS.community}` : "Joined · checking your email"}
            </span>
          ) : (
            <a
              href={COMMUNITY_JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                start(async () => {
                  setCommunity("claimed");
                  await communityAction();
                })
              }
              className={`${pillDark} self-start`}
            >
              Join GDG Jos +{POINTS.community}
            </a>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel color="bg-g-yellow">Post about DevFest · +{POINTS.xPost} each</SectionLabel>
        <div className="flex flex-col gap-3.5 rounded-3xl bg-white p-[18px]">
          <span className="text-[15px] leading-normal">
            Post on X with both hashtags and tag GDG Jos. Up to {LIMITS.xPostsPerDay} posts a day count.
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[...HASHTAGS, X_MENTION].map((h) => (
              <span key={h} className="rounded-full bg-p-yellow px-3 py-1 text-[13px] font-bold">
                {h}
              </span>
            ))}
          </div>
          <a
            href={`https://x.com/intent/post?text=${encodeURIComponent(tweetText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pillDark} self-start`}
          >
            Write a post on X
          </a>
          {hasX ? (
            <form action={postAction} className="flex flex-col gap-1.5">
              <label htmlFor="xlink" className="text-[13px] text-[#5F5F5F]">
                Posted already? Paste the link
              </label>
              <div className="flex gap-2">
                <input
                  id="xlink"
                  name="url"
                  type="url"
                  required
                  placeholder="x.com/you/status/…"
                  className="h-12 min-w-0 flex-1 rounded-full border border-[#D6D6D6] bg-[#F7F7F7] px-4 text-[15px] outline-none focus:border-g-blue"
                />
                <button disabled={posting} className={`${btn} border-2 border-ink`}>
                  {posting ? "…" : "Check"}
                </button>
              </div>
              {post && (
                <p role="status" className={`text-sm font-semibold ${post.ok ? "text-g-green" : "text-g-red"}`}>
                  {post.message}
                </p>
              )}
            </form>
          ) : (
            <p className="rounded-2xl bg-paper px-4 py-3 text-sm">
              Add your X handle to <a href="/quest/setup" className="font-bold underline">your agent</a> so we can find your
              posts.
            </p>
          )}
          {(postsToday > 0 || pendingPosts > 0) && (
            <div className="flex items-center justify-between rounded-2xl bg-p-green px-4 py-3 text-sm font-bold">
              <span>
                {postsToday} {postsToday === 1 ? "post" : "posts"} counted today
                {postsToday >= LIMITS.xPostsPerDay ? " (daily max)" : ""}
                {pendingPosts ? ` · ${pendingPosts} being checked` : ""}
              </span>
              <span>+{postsToday * POINTS.xPost}</span>
            </div>
          )}
          <p className="text-[12.5px] leading-normal text-[#5F5F5F]">
            We check posts from the X handle on your profile. Deleted posts lose their points.
          </p>
        </div>
      </section>
    </div>
  );
}
