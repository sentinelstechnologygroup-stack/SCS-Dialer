// Capability detection for audio devices in the SCS Dialer prototype.
// Reports honest states: offline, no-mediaDevices-api, no-permission,
// no-devices, or ready. Used by the audio picker and call screen to avoid
// implying a live audio bridge exists when the device cannot support it.

export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function hasMediaDevices() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === "function";
}

// Returns { state, devices, label } where state is one of:
// "offline" | "unsupported" | "no-permission" | "no-devices" | "ready"
export async function probeAudioCapability() {
  if (!isOnline()) return { state: "offline", devices: [], label: "Offline — audio devices unavailable while the device is offline." };
  if (!hasMediaDevices()) return { state: "unsupported", devices: [], label: "This browser does not expose audio devices." };

  let devices = [];
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch {
    return { state: "no-permission", devices: [], label: "Microphone permission denied — grant access to list headsets and Bluetooth devices." };
  }

  const outputs = devices.filter((d) => d.kind === "audiooutput");
  const inputs = devices.filter((d) => d.kind === "audioinput");
  const labeled = outputs.filter((d) => d.label);

  // If no output labels, the user likely hasn't granted mic permission
  // (labels are hidden until permission is granted).
  if (labeled.length === 0 && outputs.length > 0) {
    return { state: "no-permission", devices: [], label: "Grant microphone access to see device names." };
  }
  if (outputs.length === 0) {
    return { state: "no-devices", devices: [], label: "No audio output devices detected on this device." };
  }

  return {
    state: "ready",
    devices: outputs.map((d) => ({ id: d.deviceId, label: d.label || "Audio Device" })),
    inputs: inputs.length,
    label: `${labeled.length} output device${labeled.length === 1 ? "" : "s"} available.`,
  };
}

// Attempt to request mic permission (triggers the browser prompt). Returns
// true on success. Used by the audio picker "Enable" button.
export async function requestMicPermission() {
  if (!hasMediaDevices()) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}