// Device contacts access via the Contacts Provider API (Chrome Android).
// Only "pull" (pick) is supported by the platform; there is no web API to
// write back to the device contacts, so push uses a vCard download instead.

export function canPickContacts() {
  return (
    typeof navigator !== "undefined" &&
    "contacts" in navigator &&
    typeof navigator.contacts.select === "function"
  );
}

export async function pickContacts() {
  if (!canPickContacts()) return [];
  try {
    const results = await navigator.contacts.select(["name", "tel", "email"], { multiple: true });
    const picked = (results || []).map((r) => ({
      name: Array.isArray(r.name) ? r.name[0] : r.name || "",
      phone: Array.isArray(r.tel) ? r.tel[0] : r.tel || "",
      email: Array.isArray(r.email) ? r.email[0] : r.email || "",
    }));
    return picked.filter((c) => c.phone);
  } catch {
    return [];
  }
}