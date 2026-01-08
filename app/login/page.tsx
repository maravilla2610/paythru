
import { LoginForm } from "@/components/login-form"
import Image from "next/image"
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
        <Image src="/boost-logo.png" alt="Boost OTC Logo" width={100} height={33} className="self-center"/>
        <LoginForm />
      </div>
    </div>
  )
}
