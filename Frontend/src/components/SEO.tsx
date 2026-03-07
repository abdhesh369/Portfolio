import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api-helpers";

interface SeoProps {
    slug?: string;
    title?: string;
    description?: string;
    image?: string;
    keywords?: string;
    type?: string;
    noindex?: boolean;
    structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEO({
    slug,
    title: propTitle,
    description: propDescription,
    image: propImage,
    keywords: propKeywords,
    type = "website",
    noindex: propNoindex,
    structuredData,
}: SeoProps) {
    const [location] = useLocation();
    const { data: seoSettings } = useQuery({
        queryKey: ["seo", slug],
        queryFn: async () => {
            if (!slug) return null;
            return apiFetch(`/api/v1/seo/${slug}`);
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const title = seoSettings?.metaTitle || propTitle || "Abdhesh Sah | Portfolio";
    const description =
        seoSettings?.metaDescription ||
        propDescription ||
        "Portfolio of Abdhesh Sah, a Full Stack Developer.";
    const image = seoSettings?.ogImage || propImage || "/og-image.jpg";
    const keywords = seoSettings?.keywords || propKeywords || "";
    const noindex = seoSettings?.noindex ?? propNoindex ?? false;
    const twitterCard = seoSettings?.twitterCard || "summary_large_image";
    const canonicalUrl = seoSettings?.canonicalUrl || `https://abdheshsah.com.np${location}`;

    const safeJsonLd = (data: Record<string, unknown>) => {
        return JSON.stringify(data)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027');
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex,nofollow" />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={seoSettings?.ogTitle || title} />
            <meta
                property="og:description"
                content={seoSettings?.ogDescription || description}
            />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonicalUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                Array.isArray(structuredData) ? (
                    structuredData.map((data, i) => (
                        <script key={(data as Record<string, unknown>)['@type'] as string || i} type="application/ld+json">
                            {safeJsonLd(data)}
                        </script>
                    ))
                ) : (
                    <script type="application/ld+json">
                        {safeJsonLd(structuredData)}
                    </script>
                )
            )}
        </Helmet>
    );
}
