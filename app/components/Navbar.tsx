import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white">
            🥍 <span className="text-green-400">Lacrosse</span>Scores
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLink href="/" label="Scores" />
          <NavLink href="/schedule" label="Schedule" />
          <NavLink href="/results" label="Results" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
    >
      {label}
    </Link>
  );
}
