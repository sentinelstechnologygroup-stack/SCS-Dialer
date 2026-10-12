import { getCompany } from "@/lib/demoWorkspace";

export function companyPeople(companyId) {
  return companyId === "gms"
    ? [{ name: "Morgan Reyes", phone: "+1 (415) 555-0142", department: "Field Ops" }, { name: "Lina Hassan", phone: "+1 (415) 555-0119", department: "Dispatch" }]
    : [{ name: "Priya Shah", phone: "+1 (415) 555-0188", department: "Network" }, { name: "Daniel Kim", phone: "+1 (415) 555-0173", department: "Accounts" }];
}
const stamp = (companyId, id, data) => ({ ...data, id: `${companyId}:${id}`, companyId, simulated: true });
export function seedStaff(companyId) {
  return [stamp(companyId, "self", { full_name: "Demo Employee", email: `employee@${companyId}.example`, role: "admin", phone_role: "employee", extension_number: "100", ringtone: "Classic", sound_enabled: true }),
    ...companyPeople(companyId).map((person, i) => stamp(companyId, `staff:${i}`, { full_name: person.name, email: `staff${i + 1}@${companyId}.example`, role: "user", phone_role: i ? "receptionist" : "employee", extension_number: String(101 + i) }))];
}
export function seedExtensions(companyId) {
  return seedStaff(companyId).map((user, i) => stamp(companyId, `extension:${i}`, { number: user.extension_number, label: i ? user.full_name : "Demo Employee", assigned_user_id: user.id, assigned_user_name: user.full_name, role: user.phone_role, department: i ? companyPeople(companyId)[i - 1].department : "General", status: "available", voicemail_enabled: true }));
}
export function seedContacts(companyId) {
  return companyPeople(companyId).map((person, i) => stamp(companyId, `contact:${i}`, { ...person, company: getCompany(companyId).label, type: "company", email: `staff${i + 1}@${companyId}.example`, notes: "Fictional demo contact", avatar_color: "#6366f1" }));
}
export function seedDepartments(companyId) {
  return ["General", ...companyPeople(companyId).map((p) => p.department)].map((name, i) => stamp(companyId, `department:${i}`, { name, description: `${getCompany(companyId).label} fictional department` }));
}
export function seedRouting(companyId) {
  return [stamp(companyId, "routing:main", { inbound_number: companyId === "mdx" ? "+1 (415) 555-0100" : "+1 (415) 555-0200", label: "Demo main line", destination_type: "extension", destination_extension: "100", business_hours_only: false, enabled: true })];
}