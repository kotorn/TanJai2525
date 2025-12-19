import { toast } from "sonner";

export interface PrinterStatus {
  status: string;
  printerConnected: boolean;
  version: string;
}

interface BridgeResponse {
    success: boolean;
    error?: string;
}

export class HardwareService {
  private bridgeUrl = process.env.NEXT_PUBLIC_HARDWARE_BRIDGE_URL || 'http://localhost:8080';
  private bridgeToken = process.env.NEXT_PUBLIC_HARDWARE_BRIDGE_TOKEN || '';

  private getHeaders() {
      return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.bridgeToken}`
      };
  }

  /**
   * Check if the Hardware Bridge is running.
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Need headers? Status might be protected now.
      const res = await fetch(`${this.bridgeUrl}/status`, {
          headers: { 'Authorization': `Bearer ${this.bridgeToken}` }
      });
      if (res.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send order data to the local printer.
   */
  async printReceipt(order: any): Promise<boolean> { // TODO: Replace 'any' with Order type shared with KDS
    try {
      const res = await fetch(`${this.bridgeUrl}/print-receipt`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(order),
      });

      const data: BridgeResponse = await res.json();
      if (data.success) {
        toast.success("พิมพ์ใบเสร็จเรียบร้อย 🖨️");
        return true;
      } else {
        toast.error(`Print Failed: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error("Print Error:", error);
      toast.error("ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้ (Local Bridge Error)");
      return false;
    }
  }

  /**
   * Open the cash drawer.
   */
  async openDrawer(): Promise<boolean> {
    try {
      const res = await fetch(`${this.bridgeUrl}/open-drawer`, {
        method: 'POST',
        headers: this.getHeaders(), // Protected endpoint
      });
      
      const data: BridgeResponse = await res.json();
      if (data.success) {
        toast.success("เปิดลิ้นชักเรียบร้อย 💵");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Drawer Error:", error);
      toast.error("ไม่สามารถเชื่อมต่อลิ้นชักได้");
      return false;
    }
  }
}

export const hardwareService = new HardwareService();
