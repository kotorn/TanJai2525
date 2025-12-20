// apps/web/src/services/slip-verification-service.ts

interface SlipVerificationResult {
    isValid: boolean;
    amount: number;
    transferredAt: Date;
    senderName: string;
    providerUsed: string;
}

interface SlipProvider {
    name: string;
    verify(slipImage: File | Blob | string): Promise<SlipVerificationResult>;
}

// 0. Ollama Vision (Local 3090) - Zero Cost PRIORITY
class OllamaVisionProvider implements SlipProvider {
    name = 'Ollama Vision (Local)';
    async verify(slipImage: string): Promise<SlipVerificationResult> {
        try {
            const { OllamaService } = await import('../features/social-commerce/services/ollama-service');
            const prompt = `Analyze this Thai bank transfer slip and extract the following JSON: 
            {
                "isValid": boolean, 
                "amount": number, 
                "transferredAt": "ISO Date String", 
                "senderName": "string"
            }
            Only return the JSON.`;

            const responseText = await OllamaService.analyzeImage(slipImage, prompt);
            const data = JSON.parse(responseText.match(/\{[\s\S]*\}/)?.[0] || '{}');

            if (!data.amount) throw new Error('Could not extract amount');

            return {
                isValid: true,
                amount: Number(data.amount),
                transferredAt: data.transferredAt ? new Date(data.transferredAt) : new Date(),
                senderName: data.senderName || 'Unknown (Local AI)',
                providerUsed: 'Ollama'
            };
        } catch (error) {
            console.error('[OllamaVisionProvider] Failed:', error);
            throw error;
        }
    }
}

// 1. EasySlip Implementation
class EasySlipProvider implements SlipProvider {
    name = 'EasySlip';
    async verify(slipImage: string): Promise<SlipVerificationResult> {
        // Call EasySlip API
        // const res = await fetch('https://developer.easyslip.com/api/v1/verify', ...)
        // // // console.log('Verifying with EasySlip...');
        throw new Error('EasySlip timeout'); // Simulating failure for fallback demo
    }
}

// 2. SlipOK Implementation
class SlipOKProvider implements SlipProvider {
    name = 'SlipOK';
    async verify(slipImage: string): Promise<SlipVerificationResult> {
        // Call SlipOK API
        // // // console.log('Verifying with SlipOK...');
        return {
            isValid: true,
            amount: 500,
            transferredAt: new Date(),
            senderName: 'John Doe',
            providerUsed: 'SlipOK'
        };
    }
}

// 3. GPT-4 Vision Fallback
class GPT4OCRProvider implements SlipProvider {
    name = 'GPT-4 Vision';
    async verify(slipImage: string): Promise<SlipVerificationResult> {
        // Call OpenAI API
        // // // console.log('Verifying with GPT-4...');
        return {
            isValid: true,
            amount: 500,
            transferredAt: new Date(),
            senderName: 'Unknown (OCR)',
            providerUsed: 'GPT-4'
        };
    }
}

// Service Strategy with Fallback
export class SlipVerificationService {
    private providers: SlipProvider[];

    constructor() {
        // Order determines priority
        this.providers = [
            new EasySlipProvider(),
            new SlipOKProvider(),
            new GPT4OCRProvider()
        ];
    }

    async verifySlip(slipImage: string): Promise<SlipVerificationResult> {
        let lastError: any;

        for (const provider of this.providers) {
            try {
                const result = await provider.verify(slipImage);
                if (result.isValid) {
                    // // // console.log(`Slip verified successfully by ${provider.name}`);
                    return result;
                }
            } catch (error) {
                console.warn(`${provider.name} failed:`, error);
                lastError = error;
                // Continue to next provider
            }
        }

        throw new Error(`All slip verification providers failed. Last error: ${lastError}`);
    }
}

// Usage Example
// const service = new SlipVerificationService();
// const result = await service.verifySlip(base64Image);
