import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { Nav } from "@/app/_components/public/Nav";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex min-h-11 items-center gap-2">
            <span className="rounded-sm bg-white p-0.5">
              <Image src="/logo.png" alt="" width={32} height={32} priority />
            </span>
            <span className="title-sport text-lg">Foot Fianara</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav aria-label="Navigation principale" className="hidden md:block">
              <Nav bureau />
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-10 rounded-full border border-border bg-background p-2 md:hidden"
      >
        <Nav />
      </nav>
    </>
  );
}
