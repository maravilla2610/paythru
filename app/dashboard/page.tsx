import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Payment } from "@/components/dashboard/columns";
import { getUser } from "@/app/actions/user";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ];
}
export default async function DashboardPage() {
  const user = await getUser();
  const data = await getData();

  return <DashboardView data={data} user={user} />;
}
