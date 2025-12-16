"use client"

import { useTransition } from "react"
import { receivePO } from "./actions"
import { DropdownMenuItem } from "@tanjai/ui"

export function ReceivePOItem({ id, disabled }: { id: string, disabled?: boolean }) {
    const [isPending, startTransition] = useTransition()

    return (
        <DropdownMenuItem 
            disabled={disabled || isPending}
            onClick={(e) => {
                e.preventDefault()
                startTransition(async () => {
                    await receivePO(id)
                })
            }}
        >
            {isPending ? "Receiving..." : "Receive Items"}
        </DropdownMenuItem>
    )
}
