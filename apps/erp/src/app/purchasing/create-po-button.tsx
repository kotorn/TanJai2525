"use client"

import { useState } from "react"
import { createPO } from "./actions"
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
    Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@tanjai/ui"
import { Plus } from "lucide-react"

export function CreatePOButton() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await createPO(formData)
            setOpen(false)
        } catch (error) {
            console.error("Failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create PO
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                    <DialogDescription>
                        Draft a new PO to a supplier. Items can be added after creation.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right">
                                Supplier
                            </Label>
                            {/* Mock Supplier Select */}
                            <Select name="supplier_id" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sup-001">CP Foods</SelectItem>
                                    <SelectItem value="sup-002">Thai Union</SelectItem>
                                    <SelectItem value="sup-003">Betagro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="warehouse" className="text-right">
                                Ship To
                            </Label>
                             {/* Mock Warehouse Select */}
                            <Select name="warehouse_id" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wh-001">Central Kitchen</SelectItem>
                                    <SelectItem value="wh-002">Bangna Branch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Draft"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
