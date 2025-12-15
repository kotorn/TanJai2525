// lib/promptpay.ts

/**
 * Generate PromptPay Payload with CRC16 (CRC-16/CCITT-FALSE)
 */

function crc16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePromptPayPayload(phoneNumber: string, amount?: number): string {
    // 1. Payload Format Indicator (00)
    let payload = "000201";
    
    // 2. Point of Initiation Method (01) - 12 = Dynamic (QR used once), 11 = Static
    payload += amount ? "010212" : "010211";
    
    // 3. Merchant Account Information (29) - PromptPay ID
    // 00 - Application ID (A000000677010111)
    const merchantInfoId = "0016A000000677010111";
    
    // 01 - Tag for PromptPay ID (Phone or Tax ID)
    // Phone needs 0066 prefix, remove 0
    let target = phoneNumber.replace(/[^0-9]/g, '');
    if (target.startsWith('0')) {
        target = '66' + target.substring(1);
    }
    const targetTag = `01${target.length.toString().padStart(2, '0')}${target}`;
    
    const merchantInfoContent = merchantInfoId + targetTag;
    payload += `29${merchantInfoContent.length.toString().padStart(2, '0')}${merchantInfoContent}`;
    
    // 4. Country Code (58)
    payload += "5802TH";
    
    // 5. Currency Code (53) - 764 (THB)
    payload += "5303764";
    
    // 6. Transaction Amount (54)
    if (amount) {
        const amountStr = amount.toFixed(2);
        payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
    }
    
    // 7. Checksum (63)
    payload += "6304"; // Placeholder for CRC
    
    // Calculate CRC
    const checksum = crc16(payload);
    
    return payload + checksum;
}
