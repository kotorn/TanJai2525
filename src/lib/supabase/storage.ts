import { createClient } from "@/lib/supabase/client";

export const uploadRestaurantAsset = async (
    file: File,
    bucket: string = "restaurant-assets"
) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("your-project-url");

    if (isMock) {
        console.warn("[Mock Mode] Uploading file:", file.name);
        return `https://mock-storage.tanjai.app/${bucket}/${fileName}`;
    }

    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
};
