"use client"

import * as React from "react"
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@tanjai/ui"

import { getInventory } from "./actions"

export default async function InventoryPage() {
  const inventoryData = await getInventory();

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage stock levels across all warehouses.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Import</Button>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search items..." className="pl-9 border-0 shadow-none focus-visible:ring-0" />
        </div>
        <div className="h-6 w-px bg-border" />
        <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                   <TableHead className="w-[100px]">SKU</TableHead>
                   <TableHead>Item Name</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead className="text-right">Stock Level</TableHead>
                   <TableHead className="w-[100px]">Status</TableHead>
                   <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inventoryData.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium text-muted-foreground">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right font-mono">
                            {item.stock} <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </TableCell>
                        <TableCell>
                            <Badge variant={item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "secondary" : "destructive"}>
                                {item.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
