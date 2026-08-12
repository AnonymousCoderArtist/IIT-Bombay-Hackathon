"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, MessageCircle, Clock, Calendar, Search, LogOut, Settings, Users, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChatMessage = {
  id: string;
  role: "user" | "faculty";
  text: string;
  sentAt: string;
};

const MOCK_MESSAGES = [
  { role: "faculty", text: "Welcome to the assistant! Ask any question about campus, attendance, placements, or events.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Students can check their attendance percentage and submit assignments. QR check-in also available.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Event registration is open. QR codes generate for each session — scan to check in.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Placements: IIT Bombay TPO manages career talks. Apply for jobs with your resume.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Attendance 75% mandatory for exams. Monthly reports generated automatically.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Faculty can create attendance sessions and track student submission status.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Study materials + study notes auto-sync via our AI assistant.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "AI chatbot for campus FAQs — IIT Bombay knowledge base + RAG.", sentAt: new Date().toISOString() },
  { role: "faculty", text: "Face recognition attendance: QR scan at door. Student scans QR, faculty scan QR. Attendance auto-recorded.", sentAt: new Date().toISOString() },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "faculty", text: "Welcome! Ask any question about campus, attendance, placements, or events.", sentAt: new Date().toISOString() },
    { id: "2", role: "faculty", text: "Students can check attendance % and submit assignments. QR check-in available.", sentAt: new Date().toISOString() },
    { id: "3", role: "faculty", text: "Event registration QR codes generate for each session — scan to check in.", sentAt: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: msg, sentAt: new Date().toISOString() }]);
    setInput("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockReply = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "faculty", text: mockReply.text, sentAt: new Date().toISOString() }]);
    setLoading(false);

    // Simulate WebSocket notification
    if (window.location.href.includes("/dashboard")) {
      toast.success("Chat message sent!", {
        id: "chat-sent",
        description: "Message queued for real-time delivery",
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle className="size-5" />
      </Button>

      {open && (
        <Card className="w-96 h-96 shrink-0" style={{ width: 384, height: 384 }}>
          <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-primary" />
              <span className="text-sm font-medium">Chat</span>
            </div>
            <Button variant="ghost" size="icon" size="sm" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "faculty" ? "bg-primary/20" : "bg-muted"}`}
                >
                  {m.role === "faculty" ? (
                    <Users className="size-3 text-primary" />
                  ) : (
                    <span className="text-xs font-medium">👤</span>
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-none bg-primary text-primary-foreground"
                      : "rounded-tl-none border bg-card"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardContent className="px-4 pb-4">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
