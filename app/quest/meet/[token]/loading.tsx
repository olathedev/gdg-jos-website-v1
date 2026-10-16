import Loader from "@/components/quest/Loader";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4">
      <Loader label="Opening player" />
    </main>
  );
}
