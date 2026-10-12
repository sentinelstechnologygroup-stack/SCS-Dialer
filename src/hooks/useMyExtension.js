import { useDemoCollection } from "@/hooks/useDemoCollection";
import { useWorkspace } from "@/hooks/useWorkspace";
import { seedStaff, seedExtensions } from "@/lib/demoDirectoryFixtures";

// Fictional identity and directory only; real login remains platform-owned.
export function useMyExtension() {
  const workspace = useWorkspace();
  const staff = useDemoCollection("staff", seedStaff);
  const extensions = useDemoCollection("extensions", seedExtensions);
  const user = staff.find((record) => record.id === `${workspace.companyId}:self`) || null;
  const extension = extensions.find((record) => record.number === user?.extension_number) || extensions.find((record) => record.assigned_user_id === user?.id) || null;
  return { user, extension, loading: false };
}