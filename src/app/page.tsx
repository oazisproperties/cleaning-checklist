import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-teal mb-8 text-center">
        oAZis Cleaning Checklist
      </h1>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link
          href="/canyon-view"
          className="w-full py-6 text-2xl font-bold text-white bg-teal hover:bg-teal-dark rounded-2xl shadow-lg transition-colors text-center"
        >
          Canyon View
        </Link>
        <Link
          href="/diamond"
          className="w-full py-6 text-2xl font-bold text-white bg-teal hover:bg-teal-dark rounded-2xl shadow-lg transition-colors text-center"
        >
          Diamond
        </Link>
        <Link
          href="/panorama"
          className="w-full py-6 text-2xl font-bold text-white bg-teal hover:bg-teal-dark rounded-2xl shadow-lg transition-colors text-center"
        >
          Panorama
        </Link>
      </div>
    </main>
  );
}
