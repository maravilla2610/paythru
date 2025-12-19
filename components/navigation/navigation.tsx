"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPositioner, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "@/lib/domain/entities/user"

export default function Navigation({ user }: { user: User }) {
    const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {initial}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuPositioner>
                <DropdownMenuContent>
                    <DropdownMenuItem >Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuPositioner>
        </DropdownMenu>
    )
}