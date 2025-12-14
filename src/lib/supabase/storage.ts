import { createClient } from "@/lib/supabase/client";

export const uploadRestaurantAsset = async (
    file: File,
    bucket: string = "restaurant-assets"
) => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

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
