// Build and download a vCard (.vcf) so a contact can be saved into the phone's
// native contacts app. The web platform has no API to write directly to the
// device contacts, so a vCard import is the supported "push" path.

function esc(s) {
  return String(s || "").replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}

export function buildVCard(c) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(c.name)}`,
    `TEL;TYPE=CELL:${esc(c.phone)}`,
    c.email ? `EMAIL:${esc(c.email)}` : null,
    c.company ? `ORG:${esc(c.company)}` : null,
    c.notes ? `NOTE:${esc(c.notes)}` : null,
    "END:VCARD",
  ].filter(Boolean).join("\n");
}

export function downloadVCard(c) {
  const blob = new Blob([buildVCard(c)], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(c.name || "contact").replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}