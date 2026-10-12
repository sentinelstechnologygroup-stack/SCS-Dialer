import { useState } from "react";
import { FileText, ArrowLeft, Send, Paperclip, Eye, Inbox, PenSquare } from "lucide-react";
import { useDemoCollection } from "@/hooks/useDemoCollection";
import { insertItem } from "@/lib/demoStore";
import { seedFaxInbox } from "@/lib/demoFixtures";
import { formatPhone, timeAgo } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import { captureWorkspace, scheduleWorkspaceAction } from "@/lib/demoWorkspace";

// Fax inbox + composer with cover page, recipients, and preview.
// Fictional demo data; no real fax is sent.
export default function Fax() {
  const inbox = useDemoCollection("fax_inbox", seedFaxInbox);
  const [view, setView] = useState("inbox"); // inbox | detail | compose
  const [selected, setSelected] = useState(null);

  const openDetail = (item) => { setSelected(item); setView("detail"); };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Fax</h1>
            <p className="text-xs text-zinc-400">Send and receive faxes (demo)</p>
          </div>
          <div className="flex items-center gap-2">
            <SimulatedBadge />
            <button
              onClick={() => setView("compose")}
              aria-label="Compose fax"
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <PenSquare className="h-4 w-4" /> Compose
            </button>
          </div>
        </div>

        {view === "compose" ? (
          <ComposeFax onClose={() => setView("inbox")} />
        ) : view === "detail" && selected ? (
          <FaxDetail item={selected} onBack={() => setView("inbox")} />
        ) : (
          <div className="space-y-2">
            {inbox.length === 0 ? (
              <EmptyState icon={Inbox} text="No faxes yet" />
            ) : (
              inbox.map((f) => (
                <button
                  key={f.id}
                  onClick={() => openDetail(f)}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${f.direction === "inbound" ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{f.subject}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {f.direction === "inbound" ? "From" : "To"}: {f.from_name} · {formatPhone(f.from_number)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-400">
                    <p>{f.pages} {f.pages === 1 ? "page" : "pages"}</p>
                    <p>{timeAgo(f.received_at)}</p>
                    {f.status === "unread" && <span className="mt-1 inline-block rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">New</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FaxDetail({ item, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </button>
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">{item.subject}</h2>
          <SimulatedBadge />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="From" value={`${item.from_name} · ${formatPhone(item.from_number)}`} />
          <Field label="Pages" value={String(item.pages)} />
          <Field label="Direction" value={item.direction} />
          <Field label="Status" value={item.status} />
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Preview (placeholder)</p>
          <div className="space-y-2">
            {Array.from({ length: Math.min(item.pages, 3) }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-zinc-200 bg-white p-3 text-xs text-zinc-400">
                <Eye className="h-4 w-4" /> Page {i + 1} — demo preview placeholder
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-600">{item.preview}</p>
        </div>
      </div>
    </div>
  );
}

function ComposeFax({ onClose }) {
  const [workspace] = useState(captureWorkspace);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [coverPage, setCoverPage] = useState(true);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const send = (e) => {
    e.preventDefault();
    if (!to || !subject) return;
    insertItem("fax_inbox", {
      direction: "outbound",
      from_name: "You",
      from_number: workspace.companyId === "mdx" ? "+1 (415) 555-0100" : "+1 (415) 555-0200",
      to_number: to,
      subject,
      pages: coverPage ? 2 : 1,
      received_at: new Date().toISOString(),
      status: "sent",
      preview: body || "(no message)",
    }, workspace);
    setSent(true);
    scheduleWorkspaceAction(workspace, onClose, 800);
  };

  if (sent) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">Fax queued (demo)…</div>;
  }

  return (
    <form onSubmit={send} className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold">Compose Fax</h2>
      <div className="space-y-3">
        <input className="input" placeholder="Recipient fax number" value={to} onChange={(e) => setTo(e.target.value)} />
        <input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={coverPage} onChange={(e) => setCoverPage(e.target.checked)} className="h-4 w-4 rounded border-zinc-300" />
          Include cover page
        </label>
        <textarea className="input min-h-24" placeholder="Cover page message / body" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-400">
          <Paperclip className="h-4 w-4" /> Attach PDF (demo — no file attached)
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">Cancel</button>
        <button type="submit" disabled={!to || !subject} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          <Send className="h-4 w-4" /> Send Fax
        </button>
      </div>
    </form>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-zinc-400">{label}</p>
      <p className="mt-0.5 text-zinc-700">{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
      <Icon className="h-8 w-8 text-zinc-300" />
      <p className="mt-2 text-sm text-zinc-400">{text}</p>
    </div>
  );
}