const CLOUD_NAME = "dc2wtllnz";

/**
 * Generates a Cloudinary dynamic OpenGraph image URL.
 * It uses the featured image as a background and overlays the title for social sharing.
 */
export function getDynamicOgImage(title: string, imageUrl?: string): string {
    if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
        // Fallback if not a cloudinary image or no image provided
        // If no image is provided, we could use a solid color background from Cloudinary too
        const fallbackImage = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/e_brightness:-60/l_text:Arial_70_bold_center:${encodeURIComponent(title)},co_white,w_1000,c_fit,g_center/l_text:Arial_24_letter_spacing_2:ABDHESH%20SAH%20%7C%20PORTFOLIO,co_white,g_south,y_50,o_60/v1/portfolio_uploads/fallback_og.jpg`;
        return imageUrl || fallbackImage;
    }

    const parts = imageUrl.split("/upload/");
    if (parts.length !== 2) return imageUrl;

    // Transformations:
    // 1. Resize to OG standard: 1200x630
    // 2. Darken background for text legibility
    // 3. Overlay title in the center
    // 4. Add branding at the bottom
    const encodedTitle = encodeURIComponent(title)
        .replace(/%2C/g, ",") // Cloudinary uses commas for parameter separation, so we must be careful
        .replace(/,/g, "%2C");

    const transformations = `w_1200,h_630,c_fill,q_auto,f_auto/e_brightness:-60/l_text:Arial_70_bold_center:${encodedTitle},co_white,w_1000,c_fit,g_center/l_text:Arial_24_letter_spacing_2:ABDHESH%20SAH%20%7C%20PORTFOLIO,co_white,g_south,y_50,o_60`;

    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
