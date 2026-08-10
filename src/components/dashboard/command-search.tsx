"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, CalendarDays, Briefcase, User, GraduationCap, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const typeIcons = {
  student: User,
  faculty: GraduationCap,
  coordinator: GraduationCap,
  event: CalendarDays,
  assignment: FileText,
  placement: Briefcase,
};

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { type: keyof typeof typeIcons; title: string; subtitle: string; link: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  function openSearch() {
    setOpen(true);
    setQuery("");
    setResults([]);
  }

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") {
        closeSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || !query || query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open]);

  function navigate(link: string) {
    closeSearch();
    router.push(link);
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-between gap-2 text-muted-foreground sm:w-64"
        onClick={openSearch}
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" />
          <span className="text-sm">Search campus...</span>
        </span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          Ctrl K
        </kbd>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, events, assignments, placements..."
                className="border-0 focus-visible:ring-0"
              />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">Searching...</p>
              )}

              {!loading && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {query.length < 2
                    ? "Type at least 2 characters to search"
                    : "No results found"}
                </p>
              )}

              {results.map((result, index) => {
                const Icon = typeIcons[result.type] ?? Search;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(result.link)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{result.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </span>
                    <CornerDownLeft className="size-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
