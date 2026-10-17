"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink/85"
    >
      Print
    </button>
  );
}
