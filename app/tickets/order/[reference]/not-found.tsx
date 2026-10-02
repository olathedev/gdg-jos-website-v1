import Link from "next/link";

export default function OrderNotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-4 text-center text-white">
      <div>
        <h1 className="type-heading text-5xl">Order not found</h1>
        <p className="mt-4 text-white/70">Check the link in your email, or get a new ticket.</p>
        <Link href="/tickets" className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold tracking-wide text-ink uppercase hover:bg-h-yellow">
          See tickets
        </Link>
      </div>
    </main>
  );
}
