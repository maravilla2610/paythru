"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/actions/auth"
import { useActionState } from "react"

interface LoginFormProps extends React.ComponentProps<"div"> {
  mode?: "login" | "signup"
}

function openEmail(provider: "gmail" | "outlook") {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (provider === "gmail") {
    window.open(isMobile ? "googlegmail://" : "https://mail.google.com", "_blank")
  } else {
    window.open(isMobile ? "ms-outlook://" : "https://outlook.live.com", "_blank")
  }
}

export function LoginForm({
  className,
  ...props
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    login,
    null
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Access Boost OTC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              {state?.error && (
                <div className="text-sm text-red-500 px-1">{state.error}</div>
              )}
              {state?.message && (
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-green-500 px-1">{state.message}</div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEmail("gmail")}
                    >
                      Open Gmail
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEmail("outlook")}
                    >
                      Open Outlook
                    </Button>
                  </div>
                </div>
              )}
              <Field>
                <Button type="submit" disabled={isPending}>
                  Access
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
