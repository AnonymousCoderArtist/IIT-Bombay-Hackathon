"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Mic,
  Square,
  ClipboardPaste,
  FileText,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Note = {
  _id: string;
  title: string;
  subject?: string;
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  source?: string;
  createdAt: string;
};

const REC =
  typeof window !== "undefined"
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
    : undefined;

export default function LectureNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const recordingRef = useRef(false);

  function load() {
    fetch("/api/lecture-notes")
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    return () => {
      recordingRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  function toggleRecording() {
    if (!REC) {
      toast.error("Is browser me speech recognition available nahi hai (Chrome/Edge use karo)");
      return;
    }

    if (recordingRef.current) {
      recordingRef.current = false;
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    recordingRef.current = true;
    setRecording(true);

    const recognition = new REC();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        if (event.results[i][0]?.transcript) {
          text += event.results[i][0].transcript + " ";
        }
      }
      transcriptRef.current = text.trim();
      setTranscript(transcriptRef.current);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        toast.error("Microphone permission denied");
      } else if (event.error !== "aborted") {
        toast.error(`Recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (recordingRef.current) {
        recognition.start();
      } else {
        setRecording(false);
      }
    };

    recognition.start();
    toast.success("Recording shuru — lecture bolna shuru karo");
  }

  async function handleGenerate() {
    if (transcript.trim().length < 30) {
      toast.error("Transcript kam se kam 30 characters ka hona chahiye");
      return;
    }
    if (!title.trim()) {
      toast.error("Note ka title daalo");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/lecture-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          transcript: transcript.trim(),
          durationSec: 0,
          source: "live-stt",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not save note");
        return;
      }

      toast.success("Study notes ban gaye!");
      setTranscript("");
      setTitle("");
      setSubject("");
      load();
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/lecture-notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Note deleted");
      setNotes((prev) => prev.filter((n) => n._id !== id));
    }
  }

  const recSupported = Boolean(REC);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ambient Lecture Intelligence</h1>
        <p className="text-muted-foreground">
          Lecture record karo (browser STT) ya transcript paste karo — AI se structured study
          notes, key points aur action items bante hain.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="DBMS Lecture 5 - Normalization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note-subject">Subject</Label>
              <Input
                id="note-subject"
                placeholder="Database Management"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Transcript</Label>
            <Textarea
              rows={7}
              placeholder="Lecture ka text yahan aayega (record karo ya paste karo)..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={toggleRecording}
              disabled={generating}
              variant={recording ? "destructive" : "default"}
            >
              {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
              {recording ? "Stop recording" : recSupported ? "Record lecture" : "Record (unsupported)"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigator.clipboard
                  ?.readText()
                  .then((t) => {
                    if (t) setTranscript((prev) => prev + " " + t);
                    toast.success("Transcript pasted");
                  })
                  .catch(() => toast.error("Clipboard read nahi ho paya"));
              }}
              disabled={generating}
            >
              <ClipboardPaste className="size-4" />
              Paste text
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating || transcript.trim().length < 30}
              className="ml-auto"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {generating ? "AI soch raha hai..." : "Generate notes"}
            </Button>
          </div>

          {recording && (
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <span className="size-2 animate-pulse rounded-full bg-destructive" />
              Recording... bolte raho, transcript live aata rahega
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Saved notes</h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="size-10 text-muted-foreground" />
              <p className="font-medium">Koi study notes abhi nahi</p>
              <p className="text-sm text-muted-foreground">
                Pehli lecture record karo ya transcript paste karke notes banao.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => {
              const open = expanded === note._id;
              return (
                <Card key={note._id} className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col gap-2 pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{note.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {note.subject ?? "General"}
                          {" · "}
                          {new Date(note.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(note._id)}
                        aria-label="Delete note"
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {note.summary && <p className="text-sm text-muted-foreground">{note.summary}</p>}

                    {note.keyPoints && note.keyPoints.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {note.keyPoints.slice(0, open ? undefined : 3).map((p, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}

                    {open && note.actionItems && note.actionItems.length > 0 && (
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="mb-1 font-medium">Action items</p>
                        <ul className="space-y-1">
                          {note.actionItems.map((a, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-primary">→</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!note.summary && (
                      <p className="text-xs text-muted-foreground">
                        Summary generate nahi hua — AI service ya API key configure karo.
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-xs text-muted-foreground">
                        {note.transcript?.length ?? 0} chars · {note.source === "paste" ? "pasted" : "recorded"}
                      </span>
                      {note.keyPoints && note.keyPoints.length > 3 && (
                        <Button variant="ghost" size="sm" onClick={() => setExpanded(open ? null : note._id)}>
                          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          {open ? "Less" : "More"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
