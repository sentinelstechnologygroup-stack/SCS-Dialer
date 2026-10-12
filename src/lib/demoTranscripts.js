// Static, fictional demo call transcripts for the SCS Dialer prototype.
// These are invented sample dialogues labeled as demo evidence — no real
// audio exists, no provider URLs are fabricated, and no claim of actual
// recording is made. Production will use Telnyx transcription; until then
// these replace the previous automatic LLM-generated transcripts.

const SAMPLES = [
  `You: Hi, this is Jordan with MDX Communications, how can I help you today?
Caller: Hi Jordan, I'm calling about the quarterly service review for the GMS line.
You: Of course — I can see your account. Are you looking to schedule a review or discuss the latest report?
Caller: Let's schedule a review, preferably early next week.
You: Tuesday at 10am works on my end. I'll send a calendar invite right after this call.
Caller: That sounds great, thank you.
You: My pleasure. Anything else I can help with?
Caller: That's all for now, appreciate it.
You: Take care, goodbye.`,
  `You: SCS Dialer, this is Alex speaking.
Caller: Hi Alex, it's Morgan from the field team. I need to escalate a ticket to the network group.
You: I can route that for you. Do you have the ticket number handy?
Caller: Ticket is GMS-4821, it's a priority two.
You: Got it — GMS-4821, priority two. I'll loop in the network on-call engineer now and cc you on the handoff.
Caller: Perfect, thanks for the quick turnaround.
You: No problem. I'll stay on the line if you need anything else.
Caller: I'm good, thanks again.
You: Bye now.`,
  `You: Hello, MDX support line, Sam here.
Caller: Hi Sam, calling about a billing question on our recent invoice.
You: I'd be happy to help. Can I get your account number?
Caller: It's MDX-77832.
You: Thank you. Pulling that up now… I see the invoice in question. What specifically looks off?
Caller: There's a line item for conferencing that we didn't use this month.
You: I can see that — let me open a billing adjustment and flag it for review. You should see a corrected invoice within two business days.
Caller: Wonderful, thank you so much.
You: You're welcome. Have a great rest of your day.`,
  `You: This is Casey with the SCS Dialer team.
Caller: Hey Casey, quick question about provisioning a new extension for our hire.
You: Sure thing — I can set that up. What's the new employee's name and department?
Caller: Riley Chen, joining the GMS field ops group.
You: Got it. I'll create extension 4127 and assign it to Riley. You'll get a confirmation email once it's active.
Caller: Excellent, and how long until it's ready?
You: Typically within the hour. I'll follow up if there's any delay.
Caller: Sounds good, thanks Casey.
You: Anytime — goodbye.`,
];

export function pickDemoTranscript(call) {
  const idx = call?.peer_number
    ? Math.abs(hashCode(String(call.peer_number))) % SAMPLES.length
    : Math.floor(Math.random() * SAMPLES.length);
  const code = call.companyId === "gms" ? "GMS" : "MDX";
  const company = code === "GMS" ? "GMS Telecom" : "MDX Communications";
  const dialogue = SAMPLES[idx].replace(/MDX Communications/g, company).replace(/\b(?:MDX|GMS)\b/g, code)
    .replace(/Morgan/g, code === "GMS" ? "Morgan" : "Priya");
  return {
    transcript: `[DEMO — ${company} fictional sample transcript. No real audio was recorded.]\n\n${dialogue}`,
    recording_url: null,
  };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (str.charCodeAt(i) + ((h << 5) - h)) | 0;
  return h;
}