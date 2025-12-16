"use server"

export async function getPOs() {
  return [
    { 
        id: "1", 
        po_number: "PO-2023-001", 
        supplier: "CP Foods", 
        date: "2023-12-01", 
        amount: 15000, 
        status: "pending_approval" as const
    },
    { 
        id: "2", 
        po_number: "PO-2023-002", 
        supplier: "Thai Union", 
        date: "2023-12-05", 
        amount: 8500, 
        status: "received" as const
    },
     { 
        id: "3", 
        po_number: "PO-2023-003", 
        supplier: "Betagro", 
        date: "2023-12-10", 
        amount: 3200, 
        status: "draft" as const
    }
  ]
}

export async function createPO(formData: FormData) {
  console.log("Creating PO...", Object.fromEntries(formData))
  return { success: true }
}

export async function receivePO(id: string) {
    console.log("Receiving PO Item...", id)
    return { success: true }
}
