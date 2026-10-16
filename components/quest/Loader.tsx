/** Shown the instant a game screen is tapped, while the server builds it. */
export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-1 items-center justify-center py-24">
      <span className="flex items-end gap-1.5" aria-hidden>
        {["#4285F4", "#EA4335", "#F9AB00", "#34A853"].map((c, i) => (
          <span key={c} className="quest-hop size-2.5 rounded-full" style={{ background: c, animationDelay: `${i * 0.12}s` }} />
        ))}
      </span>
    </div>
  );
}
