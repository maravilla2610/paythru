"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"
import RegistrationForm from "@/components/register/registration-form"
import { User } from "@/lib/domain/entities/user"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "motion/react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingViewProps {
  user: User | null,
}

export function OnboardingView({ user }: OnboardingViewProps) {
  const [showRegistration, setShowRegistration] = useState(true)
  const router = useRouter()

  if (!showRegistration) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex max-w-md flex-col items-center text-center"
        >
          <div className="mb-6 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Registration Completed!</h2>
          <p className="mb-8 text-muted-foreground">
            Thank you for submitting your information. Your account is now under review. We will notify you once the verification process is complete.
          </p>
          <Button onClick={() => router.push('/')} size="lg">
            Return to Home
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="w-full py-12 px-4">
        <RegistrationForm 
          user={user} 
          setShowRegistration={setShowRegistration} 
          onSuccess={() => router.refresh()} 
        />
      </div>
    </ScrollArea>
  )
}

