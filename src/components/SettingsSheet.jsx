import { useEffect, useState } from "react";
import { X, Play, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RINGTONE_NAMES, playRingtone } from "@/lib/ringtones";
import { staffAdapter } from "@/services/adapters";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMyExtension } from "@/hooks/useMyExtension";

export default function SettingsSheet({ onClose }) {
  const { user } = useMyExtension();
  const workspace = useWorkspace();
  const ringtone = user?.ringtone || user?.data?.ringtone || "Classic";
  const soundOn = user?.sound_enabled !== false && user?.data?.sound_enabled !== false;
  const [sel, setSel] = useState(ringtone);
  const [on, setOn] = useState(soundOn);
  const [saving, setSaving] = useState(false);
  const [stopRef, setStopRef] = useState(null);
  useEffect(() => () => stopRef?.(), [stopRef]);

  const preview = (name) => {
    setSel(name);
    stopRef?.();
    if (on && name !== "Silent") {
      const stop = playRingtone(name);
      setStopRef(() => stop);
      setTimeout(() => stop(), 2600);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      stopRef?.();
      await staffAdapter.update(user.id, { ringtone: sel, sound_enabled: on }, workspace);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Sound & Ringtones</h2>
          <button onClick={onClose} aria-label="Close settings"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 p-3">
          <div>
            <p className="text-sm font-medium">Sound enabled</p>
            <p className="text-xs text-zinc-400">Play ringtones and in-app tones</p>
          </div>
          <Switch checked={on} onCheckedChange={setOn} />
        </div>

        <p className="mb-2 text-xs font-medium uppercase text-zinc-500">Ringtone</p>
        <div className="space-y-1">
          {RINGTONE_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => preview(name)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-zinc-50"
            >
              <span>{name}</span>
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4 text-zinc-400" />
                {sel === name && <Check className="h-4 w-4 text-indigo-600" />}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Ringtones are synthesized tones in the browser. The native app build will use the device ringtone picker.
        </p>

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}