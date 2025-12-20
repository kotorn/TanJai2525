import crypto from 'crypto';

/**
 * Verifies the X-Line-Signature header for LINE Messaging API
 */
export function verifyLineSignature(body: string, signature: string, channelSecret: string): boolean {
    if (!signature || !channelSecret) return false;

    const hash = crypto
        .createHmac('sha256', channelSecret)
        .update(body)
        .digest('base64');

    return hash === signature;
}

/**
 * Verifies the X-Hub-Signature-256 header for Facebook Messenger
 */
export function verifyFacebookSignature(body: string, signature: string, appSecret: string): boolean {
    if (!signature || !appSecret) return false;

    // Facebook signature is sha256=HASH
    const actualSignature = signature.replace('sha256=', '');

    const hash = crypto
        .createHmac('sha256', appSecret)
        .update(body)
        .digest('hex');

    return hash === actualSignature;
}
