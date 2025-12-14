"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, QrCode } from "lucide-react";
import { Table } from "@/types/database.types";
import { useRef } from "react";

export default function TableQRCode({ table }: { table: Table }) {
    // Determine the URL. Current host? 
    // In production: https://app.tanjaipos.com/table/ID
    // For dev: http://localhost:3000/table/ID (we'll assume current window origin if client)
    
    // We can rely on a fixed base URL or detect.
    // Let's us a placeholder for now that will redirect to the order page.
    // If the order page is /order?tableId=...
    
    const qrValue = typeof window !== 'undefined' 
        ? `${window.location.origin}/order?tableId=${table.id}`
        : `https://tanjaipos.com/order?tableId=${table.id}`;

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Simple print window for the QR
        const printWindow = window.open('', '', 'width=600,height=600');
        if (printWindow && printRef.current) {
            printWindow.document.write(`
                <html>
                    <head><title>Print QR - ${table.name}</title></head>
                    <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
                        <h2>${table.name}</h2>
                        ${printRef.current.innerHTML}
                        <p style="margin-top:20px;">Scan to Order</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="View QR Code">
                    <QrCode className="size-4 text-blue-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Table QR Code: {table.name}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                    <div ref={printRef} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <QRCode
                            value={qrValue}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Scan this code to start ordering for <strong>{table.name}</strong></p>
                        <p className="text-xs mt-1 text-gray-400">{qrValue}</p>
                    </div>
                     <Button onClick={handlePrint} className="w-full">
                        <Printer className="size-4 mr-2" /> Print QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
