import { toast } from "sonner";

export interface PrinterStatus {
  status: string;
  printerConnected: boolean;
  version: string;
}

export class HardwareService {
  // In production, this might be configurable via LocalStorage or Settings
  private bridgeUrl = 'http://localhost:8080';

  /**
   * Check if the Hardware Bridge is running.
   */
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.bridgeUrl}/status`);
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
  async printReceipt(order: any): Promise<boolean> {
    try {
      const res = await fetch(`${this.bridgeUrl}/print-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const data = await res.json();
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
      });
      
      const data = await res.json();
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
