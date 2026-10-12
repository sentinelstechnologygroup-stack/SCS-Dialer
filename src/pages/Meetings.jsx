import { useState } from "react";
import { Video, Plus, Calendar, Clock, Link2, ArrowLeft, Copy, Check, CalendarPlus } from "lucide-react";
import { useDemoCollection } from "@/hooks/useDemoCollection";
import { insertItem } from "@/lib/demoStore";
import { seedMeetings } from "@/lib/demoFixtures";
import { clockTime } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import { captureWorkspace, scheduleWorkspaceAction } from "@/lib/demoWorkspace";

// Meetings: scheduled, recent, and permanent rooms with a booking page preview.
// Fictional demo data; no real meeting provider is connected.
export default function Meetings() {
  const meetings = useDemoCollection("meetings", seedMeetings);
  const [view, setView] = useState("list"); // list | booking | detail
  const [selected, setSelected] = useState(null);

  const scheduled = meetings.filter((m) => m.type === "scheduled");
  const recent = meetings.filter((m) => m.type === "recent");
  const permanent = meetings.filter((m) => m.type === "permanent");

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Meetings</h1>
            <p className="text-xs text-zinc-400">Schedule, join, and manage rooms (demo)</p>
          </div>
          <div className="flex items-center gap-2">
            <SimulatedBadge />
            <button
              onClick={() => setView("booking")}
              aria-label="Schedule a meeting"
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Schedule
            </button>
          </div>
        </div>

        {view === "booking" ? (
          <BookingPreview onClose={() => setView("list")} />
        ) : view === "detail" && selected ? (
          <MeetingDetail meeting={selected} onBack={() => setView("list")} />
        ) : (
          <div className="space-y-6">
            <Section title="Permanent Rooms" icon={Link2} items={permanent} onSelect={(m) => { setSelected(m); setView("detail"); }} />
            <Section title="Scheduled" icon={Calendar} items={scheduled} onSelect={(m) => { setSelected(m); setView("detail"); }} />
            <Section title="Recent" icon={Clock} items={recent} onSelect={(m) => { setSelected(m); setView("detail"); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, items, onSelect }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <div className="space-y-2">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            aria-label={`Open meeting ${m.title}`}
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{m.title}</p>
              <p className="truncate text-xs text-zinc-500">
                {m.starts_at ? `${new Date(m.starts_at).toLocaleDateString([], { month: "short", day: "numeric" })} · ${clockTime(m.starts_at)}` : "Always available"} · {m.duration_minutes}m
              </p>
              <p className="truncate text-xs text-zinc-400">{m.participants.join(", ")}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MeetingDetail({ meeting, onBack }) {
  const [copied, setCopied] = useState(false);
  const joinLink = `scs-dialer.app/join/${meeting.room_id || "demo"}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://${joinLink}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadIcs = () => {
    if (!meeting.starts_at) return;
    const dt = (iso) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
    const start = new Date(meeting.starts_at);
    const end = new Date(start.getTime() + meeting.duration_minutes * 60000);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SCS Dialer//Demo//EN",
      "BEGIN:VEVENT",
      `UID:${meeting.id}@scs-dialer`,
      `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(start.toISOString())}`,
      `DTEND:${dt(end.toISOString())}`,
      `SUMMARY:${meeting.title}`,
      `DESCRIPTION:SCS Dialer demo meeting. Join: https://${joinLink}`,
      `LOCATION:${meeting.room}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${meeting.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button onClick={onBack} aria-label="Back to meetings" className="mb-3 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">{meeting.title}</h2>
          <SimulatedBadge />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="When" value={meeting.starts_at ? new Date(meeting.starts_at).toLocaleString() : "Permanent"} />
          <Field label="Duration" value={`${meeting.duration_minutes} min`} />
          <Field label="Room" value={meeting.room} />
          <Field label="Status" value={meeting.status} />
        </div>
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase text-zinc-400">Participants</p>
          <div className="flex flex-wrap gap-2">
            {meeting.participants.map((p) => (
              <span key={p} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">{p}</span>
            ))}
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Join link (placeholder)</p>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-indigo-600">{joinLink}</span>
            <button onClick={copyLink} aria-label="Copy join link" className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50">
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button aria-label="Join meeting (demo)" className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-500">
            <Video className="h-4 w-4" /> Join (demo)
          </button>
          {meeting.starts_at && (
            <button onClick={downloadIcs} aria-label="Download calendar invite" className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              <CalendarPlus className="h-4 w-4" /> Add to calendar (.ics)
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-400">No live meeting provider is connected. Joining is simulated; the .ics file is a real calendar placeholder.</p>
      </div>
    </div>
  );
}

function BookingPreview({ onClose }) {
  const [workspace] = useState(captureWorkspace);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [created, setCreated] = useState(false);

  const room_id = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) : "demo";

  const schedule = (e) => {
    e.preventDefault();
    if (!title) return;
    const starts_at = date && time ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString();
    insertItem("meetings", {
      title, type: "scheduled", starts_at, duration_minutes: Number(duration),
      room: "Room A", room_id: `${workspace.companyId}-${room_id}`, participants: ["You"], status: "upcoming",
    }, workspace);
    setCreated(true);
    scheduleWorkspaceAction(workspace, onClose, 800);
  };

  return (
    <div>
      <button onClick={onClose} aria-label="Back to meetings" className="mb-3 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {created ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">Meeting scheduled (demo)…</div>
      ) : (
        <form onSubmit={schedule} className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">Schedule Meeting</h2>
          <div className="space-y-3">
            <input className="input" placeholder="Meeting title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Meeting title" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Meeting date" />
              <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Meeting time" />
            </div>
            <select className="input" value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Meeting duration">
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Booking Page Preview</p>
            <p className="text-sm font-medium text-zinc-900">{title || "Meeting title"}</p>
            <p className="text-xs text-zinc-500">{date || "Date"} · {time || "Time"} · {duration} min</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600">
              <Link2 className="h-3 w-3" /> scs-dialer.app/join/{room_id}
            </div>
          </div>
          <button type="submit" disabled={!title} aria-label="Schedule meeting" className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            Schedule
          </button>
        </form>
      )}
    </div>
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