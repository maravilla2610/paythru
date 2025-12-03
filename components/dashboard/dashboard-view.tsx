"use client"

import { useState } from "react"
import { DataTable as DashboardDataTable } from "@/components/dashboard/data-table"
import { Payment, columns } from "@/components/dashboard/columns"
import RegistrationForm from "@/components/register_company/registration-form"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { User } from "@/lib/entities/user"

interface DashboardViewProps {
  data: Payment[],
  user: User | null,
}

export function DashboardView({ data, user }: DashboardViewProps) {
  const [showRegistration, setShowRegistration] = useState(false)

  if (showRegistration) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={() => setShowRegistration(false)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <RegistrationForm user={user} setShowRegistration={setShowRegistration} />
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
      <DashboardDataTable data={data} columns={columns} />
    </div>
  )
}
