// UDPated to remove dependency on 'crc'
// CRC16-CCITT (XModem) implementation for correct EMVCo Checksum

// CRC16-CCITT (XModem) implementation for correct EMVCo Checksum
function calculateCRC16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// TLV Formatter
function formatTLV(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

export function generatePromptPayQR(target: string, amount?: number): string {
    // 1. Payload Format Indicator (ID 00)
    let payload = formatTLV('00', '01');

    // 2. Point of Initiation Method (ID 01)
    // 11 = Static (Reusable), 12 = Dynamic (One-time)
    // If amount is present, usually Dynamic (12), otherwise Static (11)
    const method = amount && amount > 0 ? '12' : '11';
    payload += formatTLV('01', method);

    // 3. Merchant Account Information (ID 29 for PromptPay)
    // AID = A000000677010111 (PromptPay)
    let merchantInfo = formatTLV('00', 'A000000677010111');
    
    // Target Formatting
    const cleanTarget = target.replace(/[^0-9]/g, '');
    let targetType = '00'; // Phone -> 01, TaxID -> 02, E-Wallet -> 03
    let formattedTarget = cleanTarget;

    if (cleanTarget.length >= 15) { 
        // Likely E-Wallet ID
        targetType = '03'; 
    } else if (cleanTarget.length >= 13) {
        // Tax ID (13 chars)
        targetType = '02';
    } else {
        // Phone (10 chars, need to start with 0066...)
        targetType = '01';
        if (cleanTarget.startsWith('0')) {
            formattedTarget = '0066' + cleanTarget.substring(1);
        }
    }

    merchantInfo += formatTLV('01', targetType);
    merchantInfo += formatTLV('02', formattedTarget);
    
    payload += formatTLV('29', merchantInfo);

    // 4. Country Code (ID 58) = TH
    payload += formatTLV('58', 'TH');

    // 5. Currency (ID 53) = 764 (THB)
    payload += formatTLV('53', '764');

    // 6. Transaction Amount (ID 54) - Optional
    if (amount && amount > 0) {
        payload += formatTLV('54', amount.toFixed(2));
    }

    // 7. Checksum (ID 63)
    // Step 1: Append '6304'
    payload += '6304';
    
    // Step 2: Calculate CRC16 of the entire string so far
    const checksum = calculateCRC16(payload);
    
    // Step 3: Append CRC
    return payload + checksum;
}
