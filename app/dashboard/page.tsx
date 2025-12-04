import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getUser } from "@/app/actions/user";
import { getCompanies } from "@/app/actions/get-companies";
export default async function DashboardPage() {
  const user = await getUser();
  const companies = await getCompanies(user?.auth_id || "");

  return <DashboardView companies={companies} user={user} />;
}
