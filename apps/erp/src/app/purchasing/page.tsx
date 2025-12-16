import { getPOs, createPO } from "./actions"
import { CreatePOButton } from "./create-po-button"
import { ReceivePOItem } from "./receive-po-item" 
import { 
    Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@tanjai/ui"
import { Search, Filter, MoreHorizontal, FileText, CheckCircle2, Truck, Clock } from "lucide-react"

export default async function PurchasingPage() {
  const poData = await getPOs();

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage procurement and supplier orders.</p>
        </div>
        <div className="flex gap-2">
            <CreatePOButton />
        </div>
      </div>

       {/* KPIs / Stats Row */}
       <div className="grid gap-4 md:grid-cols-4">
        {[
            { label: "Pending Approval", value: poData.filter(p => p.status === 'pending_approval').length.toString(), icon: Clock, color: "text-amber-500" },
            { label: "Drafts", value: poData.filter(p => p.status === 'draft').length.toString(), icon: FileText, color: "text-gray-500" },
            { label: "Received (This Month)", value: poData.filter(p => p.status === 'received').length.toString(), icon: CheckCircle2, color: "text-green-500" },
            { label: "Total Spend", value: `฿${poData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: FileText, color: "text-blue-500" },
        ].map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
        ))}
       </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search PO number, supplier..." className="pl-9 border-0 shadow-none focus-visible:ring-0" />
        </div>
        <div className="h-6 w-px bg-border" />
        <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* PO Table */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                   <TableHead className="w-[120px]">PO Number</TableHead>
                   <TableHead>Supplier</TableHead>
                   <TableHead>Date</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                   <TableHead className="w-[100px]">Status</TableHead>
                   <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {poData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No purchase orders found.
                        </TableCell>
                    </TableRow>
                ) : poData.map((po) => (
                    <TableRow key={po.id}>
                        <TableCell className="font-medium font-mono">{po.po_number}</TableCell>
                        <TableCell>{po.supplier}</TableCell>
                        <TableCell className="text-muted-foreground">{po.date}</TableCell>
                        <TableCell className="text-right font-mono">
                            ฿{po.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                po.status === "received" ? "default" : 
                                po.status === "sent" ? "secondary" : 
                                po.status === "cancelled" ? "destructive" : "outline"
                            }>
                                {po.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View PO</DropdownMenuItem>
                                    <ReceivePOItem id={po.id} disabled={po.status === 'received'} />
                                    <DropdownMenuItem className="text-destructive">Cancel PO</DropdownMenuItem>
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

function MoreHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    )
}
