
import { LoginForm } from "@/components/login-form"
import { createClient } from "@/lib/providers/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/onboarding")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-xl font-bold text-white">Paythru</h1>
        <LoginForm />
      </div>
    </div>
  )
}
