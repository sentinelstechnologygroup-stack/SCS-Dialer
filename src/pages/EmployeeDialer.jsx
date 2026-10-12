import { useState } from "react";
import { Grid3x3, Clock, Users, Voicemail as VoicemailIcon, MessageSquare } from "lucide-react";
import { useMyExtension } from "@/hooks/useMyExtension";
import { startOutboundCall } from "@/lib/callActions";
import DialPad from "@/components/dialer/DialPad";
import RecentsList from "@/components/dialer/RecentsList";
import ContactsList from "@/components/dialer/ContactsList";
import VoicemailList from "@/components/dialer/VoicemailList";
import MessagesTab from "@/components/dialer/MessagesTab";

const TABS = [
  { id: "keypad", label: "Keypad", icon: Grid3x3 },
  { id: "recents", label: "Recents", icon: Clock },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "voicemail", label: "Voicemail", icon: VoicemailIcon },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export default function EmployeeDialer() {
  const { user, extension } = useMyExtension();
  const [tab, setTab] = useState("keypad");
  const [openConv, setOpenConv] = useState(null);

  const handleCall = async (number, name) => {
    if (!user) return;
    await startOutboundCall({ user, extension, peerNumber: number, peerName: name });
  };

  const openConversation = (peerNumber, peerName) => {
    setOpenConv({ peerNumber, peerName });
    setTab("messages");
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === "keypad" && <DialPad onCall={handleCall} />}
        {tab === "recents" && <RecentsList onCall={handleCall} />}
        {tab === "contacts" && <ContactsList onCall={handleCall} onMessage={openConversation} />}
        {tab === "voicemail" && <VoicemailList />}
        {tab === "messages" && (
          <MessagesTab initialConv={openConv} onConsumed={() => setOpenConv(null)} />
        )}
      </div>

      <nav className="flex shrink-0 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                active ? "text-indigo-600" : "text-zinc-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}