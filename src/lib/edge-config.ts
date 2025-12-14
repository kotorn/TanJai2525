import { createClient } from "@vercel/edge-config";

export const edgeConfig = createClient(process.env.EDGE_CONFIG);

export async function getFeatureFlag(key: string) {
    try {
        const value = await edgeConfig.get(key);
        return value;
    } catch (error) {
        console.error("Failed to fetch feature flag", error);
        return null;
    }
}
