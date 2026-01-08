import { getUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
