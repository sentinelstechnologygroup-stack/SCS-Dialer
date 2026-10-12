// Fictional bundled MMS attachment previews for the SCS Dialer prototype.
//
// These are inline SVG data URIs — truly local, no network, no upload, no
// signed URL. The real storage provider stays behind the message adapter
// for production; the prototype has zero runtime dependency on it.
//
// Every attachment is labeled simulated in the UI. Nothing here claims to be
// a real uploaded file.

const svg = (label, c1, c2) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>` +
      `</linearGradient></defs>` +
      `<rect width='320' height='240' fill='url(#g)'/>` +
      `<text x='160' y='118' font-family='sans-serif' font-size='15' fill='white' text-anchor='middle' opacity='0.95'>${label}</text>` +
      `<text x='160' y='138' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle' opacity='0.7'>Simulated MMS preview</text>` +
    `</svg>`
  );

export const DEMO_ATTACHMENT_IMAGES = [
  svg("Demo photo", "#6366f1", "#8b5cf6"),
  svg("Demo photo", "#0ea5e9", "#22c55e"),
  svg("Demo photo", "#f97316", "#ec4899"),
  svg("Demo photo", "#14b8a6", "#0ea5e9"),
];

// Pick a random fictional bundled preview image for an outgoing MMS.
export function pickDemoAttachmentImage() {
  return DEMO_ATTACHMENT_IMAGES[Math.floor(Math.random() * DEMO_ATTACHMENT_IMAGES.length)];
}