import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Send, Trash2, Check, CheckCheck, Sparkles, Paperclip, RotateCw, X } from "lucide-react";
import { messageAdapter } from "@/services/adapters";
import { pickDemoAttachmentImage } from "@/lib/demoAttachments";
import {
  fetchConversation, sendMessage, markConversationRead,
  demoInboundReply, demoReadReceipt,
  parseAttachments,
  loadDraft, saveDraft, clearDraft,
} from "@/lib/messaging";
import { formatPhone, clockTime } from "@/lib/phoneUtils";
import { playTone } from "@/lib/ringtones";
import { useMyExtension } from "@/hooks/useMyExtension";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";
import { reportDemoError } from "@/lib/demoErrors";

const REACTIONS = ["👍", "❤️", "😂", "😮", "🙏"];

export default function ConversationView({ peerNumber, peerName, onBack }) {
  const { user } = useMyExtension();
  const workspace = useWorkspace();
  const [items, setItems] = useState([]);
  const [body, setBody] = useState(() => loadDraft(peerNumber, workspace));
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [forceFail, setForceFail] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);
  const fileRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const msgs = await fetchConversation(user.id, peerNumber, workspace);
      if (!isCurrentWorkspace(workspace)) return;
      setItems(msgs);
      await markConversationRead(user.id, peerNumber, workspace);
    } catch (error) {
      reportDemoError(error);
    } finally {
      setLoading(false);
    }
  }, [user, peerNumber, workspace]);

  useEffect(() => {
    refresh();
    const unsub = messageAdapter.subscribe(() => { if (isCurrentWorkspace(workspace)) refresh(); }, workspace);
    return () => { if (typeof unsub === "function") unsub(); };
  }, [refresh]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length, typing]);

  // Persist draft locally so navigating away doesn't lose it.
  useEffect(() => {
    if (isCurrentWorkspace(workspace)) saveDraft(peerNumber, body, workspace);
  }, [body, peerNumber, workspace]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Fictional bundled preview — no real upload, no storage provider dependency.
    setPendingFile({ name: file.name, url: pickDemoAttachmentImage() });
    e.target.value = "";
  };

  const send = async (e) => {
    e?.preventDefault();
    if ((!body.trim() && !pendingFile) || !user || !isCurrentWorkspace(workspace)) return;
    setSending(true);
    const text = body.trim();
    const attachments = pendingFile ? [{ kind: "image", name: pendingFile.name, url: pendingFile.url }] : [];
    try {
      await sendMessage({ user, peerNumber, peerName, body: text || "(attachment)", attachments, status: forceFail ? "failed" : "sent", workspace });
      if (!isCurrentWorkspace(workspace)) return;
      if (forceFail) { playTone("end"); return; }
      clearDraft(peerNumber, workspace);
      setBody(""); setPendingFile(null); playTone("sent");
    } catch (error) {
      // A persistence failure is not a simulated delivery failure: never
      // fabricate a second record or discard the unsaved draft/attachment.
      reportDemoError(error);
    } finally { if (isCurrentWorkspace(workspace)) setSending(false); }
  };

  const retry = async (m) => {
    await messageAdapter.update(m.id, { status: "sent" }, workspace);
    if (!isCurrentWorkspace(workspace)) return;
    // Clear the composer only if it still exactly matches the retried message
    // (text + attachment). A newer edited draft is preserved to avoid a duplicate send.
    const retriedText = m.body === "(attachment)" ? "" : m.body;
    const retriedAtts = parseAttachments(m);
    const textMatches = body.trim() === retriedText;
    const attMatches =
      (!pendingFile && retriedAtts.length === 0) ||
      (!!pendingFile && retriedAtts.length === 1 &&
        retriedAtts[0].name === pendingFile.name && retriedAtts[0].url === pendingFile.url);
    if (textMatches && attMatches) {
      clearDraft(peerNumber, workspace);
      setBody("");
      setPendingFile(null);
    }
    refresh();
  };

  const react = async (m, emoji) => {
    setPickerFor(null);
    await messageAdapter.update(m.id, { reaction: m.reaction === emoji ? "" : emoji }, workspace);
  };
  const remove = async (m) => {
    setPickerFor(null);
    await messageAdapter.remove(m.id, workspace);
  };

  // Explicit demo controls — only fired when the user picks them.
  const demoTyping = () => {
    setShowDemo(false);
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 2600);
  };
  const demoReply = async () => {
    setShowDemo(false);
    await demoInboundReply({ user, peerNumber, peerName, workspace });
  };
  const demoRead = async () => {
    setShowDemo(false);
    await demoReadReceipt({ user, peerNumber, workspace });
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-zinc-200 px-3 py-2.5">
        <button onClick={onBack} aria-label="Back to conversations" className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900">{peerName || formatPhone(peerNumber)}</p>
          <p className="truncate text-xs text-zinc-500">{formatPhone(peerNumber)}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowDemo((s) => !s)} aria-label="Demo controls" className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
            <Sparkles className="h-5 w-5" />
          </button>
          {showDemo && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowDemo(false)} />
              <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
                <p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wide text-zinc-400">Demo only</p>
                <button onClick={demoReply} className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">Simulate inbound reply</button>
                <button onClick={demoRead} className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">Show read receipt</button>
                <button onClick={demoTyping} className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">Show typing indicator</button>
                <button onClick={() => { setForceFail((f) => !f); setShowDemo(false); }} className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">
                  {forceFail ? "Disable fail-next" : "Simulate fail-next send"}
                </button>
              </div>
            </>
          )}
        </div>
        <SimulatedBadge />
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>
        ) : !items.length ? (
          <p className="py-8 text-center text-sm text-zinc-400">No messages yet — say hello.</p>
        ) : (
          items.map((m) => {
            const atts = parseAttachments(m);
            const failed = m.status === "failed";
            return (
              <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                <div className="relative max-w-[78%]">
                  <button
                    onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
                    aria-label="React to message"
                    className={`block rounded-2xl px-3.5 py-2 text-left text-sm ${m.direction === "outbound" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-900"} ${failed ? "ring-2 ring-red-300" : ""}`}
                  >
                    {atts.map((a, i) => (
                      <AttachmentPreview key={i} attachment={a} />
                    ))}
                    {m.body && <span className="whitespace-pre-line">{m.body}</span>}
                    <span className={`mt-1 block text-right text-[10px] ${m.direction === "outbound" ? "text-indigo-200" : "text-zinc-400"}`}>
                      {clockTime(m.created_date)}
                      {m.direction === "outbound" && (failed
                        ? <span className="ml-1 text-red-300">Failed</span>
                        : m.read
                          ? <CheckCheck className="ml-1 inline h-3 w-3" />
                          : <Check className="ml-1 inline h-3 w-3" />)}
                    </span>
                  </button>
                  {failed && (
                    <button
                      onClick={() => retry(m)}
                      aria-label="Retry sending message"
                      className="absolute -bottom-3 right-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white shadow"
                    >
                      <RotateCw className="h-3 w-3" /> Retry
                    </button>
                  )}
                  {m.reaction && (
                    <span className="absolute -bottom-2 right-2 rounded-full bg-white px-1.5 text-xs shadow ring-1 ring-zinc-200">{m.reaction}</span>
                  )}
                  {pickerFor === m.id && (
                    <div className="absolute z-10 mt-1 flex items-center gap-0.5 rounded-full bg-white p-1 shadow-lg ring-1 ring-zinc-200">
                      {REACTIONS.map((r) => (
                        <button key={r} onClick={() => react(m, r)} aria-label={`React ${r}`} className="rounded-full px-1.5 py-0.5 text-base hover:bg-zinc-100">{r}</button>
                      ))}
                      <button onClick={() => remove(m)} aria-label="Delete message" className="rounded-full px-1.5 py-1 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500">
              <span className="animate-pulse">typing…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {pendingFile && (
        <div className="flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2">
          <img src={pendingFile.url} alt={pendingFile.name} className="h-10 w-10 rounded object-cover" />
          <span className="flex-1 truncate text-xs text-zinc-600">{pendingFile.name}</span>
          <button onClick={() => setPendingFile(null)} aria-label="Remove attachment" className="rounded p-1 text-zinc-400 hover:bg-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={send} className="flex items-center gap-2 border-t border-zinc-200 p-3 pb-[env(safe-area-inset-bottom)]">
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach image" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100">
          <Paperclip className="h-5 w-5" />
        </button>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Text message" className="input" />
        <button type="submit" disabled={sending || (!body.trim() && !pendingFile)} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

// Renders a fictional bundled MMS attachment preview directly from its local
// data URI — no signed URL, no storage provider dependency.
function AttachmentPreview({ attachment }) {
  if (attachment.kind === "image" && attachment.url) {
    return (
      <img src={attachment.url} alt={attachment.name} className="mb-1 max-h-40 max-w-full rounded-lg object-cover" />
    );
  }
  return (
    <div className="mb-1 flex items-center gap-1.5 rounded-lg bg-black/10 px-2 py-1.5 text-xs">
      <Paperclip className="h-3.5 w-3.5" /> {attachment.name}
    </div>
  );
}