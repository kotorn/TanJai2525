const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

// Mock Printer Configuration (Change to 'interface: //./COM1' or specific driver for real hardware)
let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://127.0.0.1:9100', // Use TCP as a safe placeholder that doesn't require native drivers
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    lineCharacter: "=",
    options: {
        timeout: 5000
    }
});

// 1. Status Check
app.get('/status', async (req, res) => {
    try {
        const isConnected = await printer.isPrinterConnected();
        res.json({
            status: 'online',
            printerConnected: isConnected,
            version: '1.0.0'
        });
    } catch (error) {
        res.json({
            status: 'online',
            printerConnected: false,
            error: error.message
        });
    }
});

// 2. Print Receipt
app.post('/print-receipt', async (req, res) => {
    try {
        const order = req.body;
        console.log('[Bridge] Printing Receipt for Order:', order.id);

        printer.clear();
        printer.alignCenter();
        printer.println("TANJAI POS");
        printer.println("Street Food Revolution");
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Order: ${order.id}`);
        printer.println(`Date: ${new Date().toLocaleString()}`);
        printer.println(`Table: ${order.tableId || 'N/A'}`);
        printer.drawLine();

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                printer.tableCustom([
                    { text: item.name, align: "LEFT", width: 0.5 },
                    { text: `${item.quantity}x`, align: "CENTER", width: 0.2 },
                    { text: `${item.price}`, align: "RIGHT", width: 0.3 }
                ]);
            });
        }

        printer.drawLine();
        printer.alignRight();
        printer.println(`Total: ${order.totalAmount}`);
        printer.cut();

        try {
            await printer.execute();
            console.log('[Bridge] Print Success');
            res.json({ success: true });
        } catch (printError) {
            console.error('[Bridge] Print Execution Failed:', printError);
            // For development, we return success even if hardware fails, to not block UI
            res.json({ success: false, error: printError.message });
        }

    } catch (error) {
        console.error('[Bridge] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Open Drawer
app.post('/open-drawer', async (req, res) => {
    console.log('[Bridge] Opening Cash Drawer');
    try {
        printer.openCashDrawer();
        await printer.execute();
        res.json({ success: true });
    } catch (error) {
        console.error('[Bridge] Failed to open drawer:', error);
        res.json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🖨️ Hardware Bridge running on http://localhost:${port}`);
});
