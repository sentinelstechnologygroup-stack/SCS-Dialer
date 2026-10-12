import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { messageAdapter } from "@/services/adapters";
import { fetchConversations } from "@/lib/messaging";
import { formatPhone, timeAgo, initials, colorForName } from "@/lib/phoneUtils";
import { useMyExtension } from "@/hooks/useMyExtension";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";

export default function ConversationList({ onOpen }) {
  const { user } = useMyExtension();
  const workspace = useWorkspace();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [num, setNum] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const conversations = await fetchConversations(user.id, workspace);
      if (isCurrentWorkspace(workspace)) setItems(conversations);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, workspace]);

  useEffect(() => {
    refresh();
    const unsub = messageAdapter.subscribe(() => { if (isCurrentWorkspace(workspace)) refresh(); }, workspace);
    return () => { if (typeof unsub === "function") unsub(); };
  }, [refresh]);

  const startNew = () => {
    if (!num.trim()) return;
    onOpen(num.trim(), "");
    setNum("");
    setComposing(false);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      <div className="mb-3 mt-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Messages</h2>
        <button
          onClick={() => setComposing((c) => !c)}
          aria-label="New conversation"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {composing && (
        <div className="mb-3 flex gap-2">
          <input
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="Enter phone number"
            aria-label="New conversation phone number"
            className="input"
          />
          <button
            onClick={startNew}
            aria-label="Start conversation"
            className="shrink-0 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Start
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading…</div>
      ) : !items.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
          <MessageSquare className="h-8 w-8" />
          <p className="text-sm">No conversations yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-1">
          {items.map((m) => (
            <button
              key={m.conversation_id + m.id}
              onClick={() => onOpen(m.peer_number, m.peer_name)}
              aria-label={`Open conversation with ${m.peer_name || "unknown"}`}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-zinc-50"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: colorForName(m.peer_name || m.peer_number) }}
              >
                {initials(m.peer_name || "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {m.peer_name || formatPhone(m.peer_number)}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {m.direction === "outbound" ? "You: " : ""}
                  {m.body}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-zinc-400">{timeAgo(m.created_date)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}