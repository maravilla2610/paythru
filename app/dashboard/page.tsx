import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getUser } from "@/lib/actions/user";
import { getCompanies } from "@/lib/actions/get-companies";


export default async function DashboardPage() {
  const user = await getUser();
  const companies = await getCompanies(user ? user.id : null);

  return <DashboardView companies={companies} user={user} />;
}
