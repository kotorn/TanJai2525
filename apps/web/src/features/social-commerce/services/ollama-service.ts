export interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

export class OllamaService {
    private static apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

    /**
     * Sends a chat request to the local Ollama instance
     */
    static async chat(message: string, systemPrompt: string, model: string = 'llama3'): Promise<string> {
        if (!process.env.OLLAMA_API_URL) {
            console.warn('[OllamaService] OLLAMA_API_URL not set. Local AI features may not work.');
            throw new Error('OLLAMA_API_URL_NOT_SET');
        }

        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    stream: false
                })
            });

            if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

            const data: OllamaResponse = await response.json();
            return data.message.content;
        } catch (error) {
            console.error('[OllamaService] Error:', error);
            throw error;
        }
    }

    /**
     * Analyzes an image (e.g., payment slip) using Vision models
     */
    static async analyzeImage(imageData: string, prompt: string, model: string = 'llama3.2-vision'): Promise<string> {
        if (!process.env.OLLAMA_API_URL) throw new Error('OLLAMA_API_URL_NOT_SET');

        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                            images: [imageData.replace(/^data:image\/[a-z]+;base64,/, '')]
                        }
                    ],
                    stream: false
                })
            });

            if (!response.ok) throw new Error(`Ollama Vision error: ${response.statusText}`);

            const data: OllamaResponse = await response.json();
            return data.message.content;
        } catch (error) {
            console.error('[OllamaService] Vision Error:', error);
            throw error;
        }
    }
}
