import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { getUser } from "@/lib/actions/user";


export default async function DashboardPage() {
  const user = await getUser();

  return <OnboardingView user={user} />;
}
