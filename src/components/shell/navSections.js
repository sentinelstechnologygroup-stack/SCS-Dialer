import {
  Star, Grid3x3, Clock, Users, Voicemail as VoicemailIcon,
  MessageSquare, Hash, FileText, Video, Plug, Settings as SettingsIcon,
} from "lucide-react";

// Primary navigation sections for SCS Dialer. Shared between the desktop
// sidebar and the mobile bottom tabs / More sheet.
export const NAV_SECTIONS = [
  { id: "favorites", label: "Favorites", icon: Star, path: "/favorites", primary: true },
  { id: "keypad", label: "Keypad", icon: Grid3x3, path: "/keypad", primary: true },
  { id: "recents", label: "Calls", icon: Clock, path: "/recents", primary: true },
  { id: "contacts", label: "Contacts", icon: Users, path: "/contacts", primary: true },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages", primary: true },
  { id: "voicemail", label: "Voicemail", icon: VoicemailIcon, path: "/voicemail" },
  { id: "team-chat", label: "Team Chat", icon: Hash, path: "/team-chat" },
  { id: "fax", label: "Fax", icon: FileText, path: "/fax" },
  { id: "meetings", label: "Meetings", icon: Video, path: "/meetings" },
  { id: "integrations", label: "Integrations", icon: Plug, path: "/integrations" },
  { id: "settings", label: "Settings", icon: SettingsIcon, path: "/settings" },
];

export const PRIMARY_SECTIONS = NAV_SECTIONS.filter((s) => s.primary);
export const SECONDARY_SECTIONS = NAV_SECTIONS.filter((s) => !s.primary);