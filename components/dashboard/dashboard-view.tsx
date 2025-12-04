"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable as DashboardDataTable } from "@/components/dashboard/data-table"
import { columns } from "@/components/dashboard/columns"
import RegistrationForm from "@/components/register_company/registration-form"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { User } from "@/lib/entities/user"
import { CompanyFormData as Company } from "@/lib/entities/company"

interface DashboardViewProps {
  companies: Company[],
  user: User | null,
}

export function DashboardView({ companies, user }: DashboardViewProps) {
  const [showRegistration, setShowRegistration] = useState(false)
  const router = useRouter()

  if (showRegistration) {
    return (
      <div className="relative min-h-screen w-full">
        <div className="flex min-h-screen items-center justify-center py-12">
          <RegistrationForm user={user} setShowRegistration={setShowRegistration} onSuccess={() => router.refresh()} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => setShowRegistration(true)}>
          <Plus className="mr-2 h-4 w-4" /> Register Company
        </Button>
      </div>
      <DashboardDataTable data={companies} columns={columns} />
    </div>
  )
}
