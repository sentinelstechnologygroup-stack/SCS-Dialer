import { useState, useMemo } from "react";
import { Hash, Search, Send, Users, Lock, ArrowLeft } from "lucide-react";
import { useDemoCollection } from "@/hooks/useDemoCollection";
import { insertItem, updateItem } from "@/lib/demoStore";
import { seedTeamChannels, seedTeamMessages } from "@/lib/demoFixtures";
import { clockTime, colorForName, initials } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

// Team Chat with channels/groups, replies, reactions, mentions, and search.
// All data is fictional and persisted locally (demo store).
export default function TeamChat() {
  const channels = useDemoCollection("team_channels", seedTeamChannels);
  const messages = useDemoCollection("team_messages", seedTeamMessages);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const active = channels.find((c) => c.id === activeId) || null;
  const thread = useMemo(
    () => messages.filter((m) => m.channel_id === active?.id).sort((a, b) => new Date(a.at) - new Date(b.at)),
    [messages, active?.id]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return messages.filter((m) => m.body.toLowerCase().includes(q));
  }, [query, messages]);

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const mentions = draft.match(/@(\w+)/g)?.map((m) => m.slice(1)) || [];
    insertItem("team_messages", {
      channel_id: active.id,
      author: "You",
      body: draft.trim(),
      at: new Date().toISOString(),
      reactions: [],
      mentions,
    });
    setDraft("");
  };

  const react = (m, emoji) => {
    const reactions = m.reactions?.includes(emoji)
      ? m.reactions.filter((r) => r !== emoji)
      : [...(m.reactions || []), emoji];
    updateItem("team_messages", m.id, { reactions });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Channel list */}
      <div className={`flex w-full flex-col border-r border-zinc-200 bg-white md:w-64 md:shrink-0 ${active ? "hidden md:flex" : "flex"}`}>
        <div className="border-b border-zinc-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-zinc-900">Team Chat</h1>
            <SimulatedBadge />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages"
              className="input pl-8"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {channels.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">No channels</p>
          ) : (
            channels.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveId(c.id); setQuery(""); }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                  active?.id === c.id ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {c.type === "group" ? <Lock className="h-4 w-4 shrink-0" /> : <Hash className="h-4 w-4 shrink-0" />}
                <span className="flex-1 truncate">{c.name}</span>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread / search results */}
      <div className={`flex min-w-0 flex-1 flex-col bg-zinc-50 ${active ? "flex" : "hidden md:flex"}`}>
        {searchResults ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-2xl">
              <p className="mb-3 text-sm font-medium text-zinc-700">Results for "{query}"</p>
              {searchResults.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No matches</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((m) => {
                    const ch = channels.find((c) => c.id === m.channel_id);
                    return (
                      <div key={m.id} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                        <p className="text-xs text-zinc-400">#{ch?.name || "unknown"} · {m.author}</p>
                        <p className="mt-1 text-zinc-700">{m.body}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : !active ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Select a channel</div>
        ) : (
          <>
            <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
              <button onClick={() => setActiveId(null)} aria-label="Back to channels" className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              {active.type === "group" ? <Lock className="h-4 w-4 text-zinc-400" /> : <Hash className="h-4 w-4 text-zinc-400" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900">{active.name}</p>
                <p className="flex items-center gap-1 text-xs text-zinc-400">
                  <Users className="h-3 w-3" /> {active.members} members · {active.description}
                </p>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No messages in this channel yet</p>
              ) : (
                thread.map((m) => (
                  <div key={m.id} className="flex gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: colorForName(m.author) }}
                    >
                      {initials(m.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-zinc-900">{m.author}</span>
                        <span className="text-xs text-zinc-400">{clockTime(m.at)}</span>
                      </p>
                      <p className="text-sm text-zinc-700">
                        {renderMentions(m.body)}
                      </p>
                      {m.reactions?.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {m.reactions.map((r) => (
                            <button key={r} onClick={() => react(m, r)} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs hover:bg-zinc-200">
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-1 flex gap-1">
                        {["👍", "❤️", "🎉"].map((r) => (
                          <button key={r} onClick={() => react(m, r)} className="rounded px-1 text-xs text-zinc-400 hover:bg-zinc-100">{r}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3 pb-[env(safe-area-inset-bottom)]">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message #${active.name}`} className="input" />
              <button type="submit" disabled={!draft.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function renderMentions(body) {
  const parts = body.split(/(@\w+)/g);
  return parts.map((p, i) =>
    p.startsWith("@") ? <span key={i} className="rounded bg-indigo-50 px-1 font-medium text-indigo-700">{p}</span> : p
  );
}