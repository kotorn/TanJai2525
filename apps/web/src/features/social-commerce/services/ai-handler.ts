export class AIHandler {
    private static apiKey = process.env.GEMINI_API_KEY;
    private static apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    /**
     * Asks Gemini AI for a response based on user message and provided context
     */
    static async askGemini(message: string, systemPrompt: string): Promise<string> {
        if (!this.apiKey) {
            console.warn('[AIHandler] GEMINI_API_KEY is not set. Falling back to default message.');
            return "ขออภัยครับ ระบบ AI กำลังอยู่ระหว่างการปรับปรุง กรุณารอสักครู่นะครับ";
        }

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: `System Prompt: ${systemPrompt}\n\nUser Message: ${message}` }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[AIHandler] Gemini API error:', errorData);
                throw new Error('Gemini API call failed');
            }

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            return aiResponse || "ขออภัยครับ ผมไม่สามารถประมวลผลคำตอบได้ในขณะนี้";
        } catch (error) {
            console.error('[AIHandler] Error calling Gemini:', error);
            return "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับผู้ช่วย AI";
        }
    }
}
