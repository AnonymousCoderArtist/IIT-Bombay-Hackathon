"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: string[];
};

const SUGGESTIONS = [
  "IIT Bombay me attendance kitni required hai?",
  "Placements ke baare me batao",
  "Mood Indigo kya hai?",
  "Hostels kitne hain IIT Bombay me?",
  "Scholarship kaise milti hai?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Namaste! Main IIT Bombay ka Smart Campus AI assistant hoon. Admission, attendance, placements, hostels, fests ya kisi bhi campus cheez ke baare me pucho. Knowledge base se grounded answers deta hoon, sources ke saath.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "bot", text: data.answer, sources: data.sources },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <PageHeader
        icon={<Sparkles className="size-5" />}
        title="AI Assistant"
        subtitle="IIT Bombay campus knowledge RAG — LLM se grounded answers, citations ke saath."
      />

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {m.role === "bot" ? (
                    <Bot className="size-4 text-primary" />
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-none bg-primary text-primary-foreground"
                      : "rounded-tl-none border bg-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sources: {m.sources.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-xl rounded-tl-none border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Soch raha hoon...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Campus ke baare me kuch pucho..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
