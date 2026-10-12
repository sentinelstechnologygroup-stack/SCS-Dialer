import { useState } from "react";
import { Bell, Volume2, Phone, Vibrate, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { loadCollection, saveCollection } from "@/lib/demoStore";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

// Notification & preferences page. Settings are persisted in the local demo
// store (no backend dependency). Ringtone selection still opens via the header
// settings sheet, which uses the user profile.
function loadPrefs() {
  const items = loadCollection("notification_prefs");
  return items[0] || {
    push_calls: true,
    push_messages: true,
    push_voicemail: true,
    push_fax: false,
    quiet_hours: false,
    vibrate: true,
  };
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(loadPrefs);

  const toggle = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    saveCollection("notification_prefs", [next]);
    setPrefs(next);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Settings</h1>
            <p className="text-xs text-zinc-400">Notifications and preferences</p>
          </div>
          <SimulatedBadge />
        </div>

        <Section title="Notifications" icon={Bell}>
          <Pref label="Incoming calls" desc="Push notification for inbound calls" checked={prefs.push_calls} onChange={() => toggle("push_calls")} />
          <Pref label="Messages" desc="New SMS/MMS notifications" checked={prefs.push_messages} onChange={() => toggle("push_messages")} />
          <Pref label="Voicemail" desc="When a voicemail is received" checked={prefs.push_voicemail} onChange={() => toggle("push_voicemail")} />
          <Pref label="Fax" desc="Inbound fax notifications" checked={prefs.push_fax} onChange={() => toggle("push_fax")} />
          <Pref label="Quiet hours" desc="Silence non-urgent notifications" checked={prefs.quiet_hours} onChange={() => toggle("quiet_hours")} />
        </Section>

        <Section title="Device" icon={Phone}>
          <Pref label="Vibrate" desc="Vibrate on incoming calls and messages" icon={Vibrate} checked={prefs.vibrate} onChange={() => toggle("vibrate")} />
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">Ringtones & sound</p>
                <p className="text-xs text-zinc-400">Open the sound sheet from the header</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="About" icon={Shield}>
          <div className="rounded-lg border border-zinc-200 p-3 text-xs text-zinc-500">
            <p className="font-medium text-zinc-700">SCS Dialer</p>
            <p className="mt-1">White-label employee communications model owned by Sentinels Technology Group.</p>
            <p className="mt-1">Admin console: separate app (6acbfc65d754d83c3aff0a80).</p>
            <p className="mt-1">All calls, messages, faxes, and meetings are simulated demo data.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Pref({ label, desc, checked, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-zinc-400">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}