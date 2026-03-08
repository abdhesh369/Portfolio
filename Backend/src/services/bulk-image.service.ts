import { projectRepository } from "../repositories/project.repository.js";
import { testimonialRepository } from "../repositories/testimonial.repository.js";
import { articleRepository } from "../repositories/article.repository.js";
import { settingsRepository } from "../repositories/settings.repository.js";
import { seoSettingsRepository } from "../repositories/seo-settings.repository.js";
import { UploadService } from "./upload.service.js";
import { logger } from "../lib/logger.js";

export interface OptimizationStats {
    totalScanned: number;
    migratedToCloudinary: number;
    optimizedUrls: number;
    failed: number;
}

export class BulkImageService {
    private static CLOUDINARY_REGEX = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)/;
    private static OPTIMIZATION_PARAMS = "q_auto,f_auto";

    /**
     * Scans and optimizes all images in the database.
     */
    static async optimizeAll(): Promise<OptimizationStats> {
        const stats: OptimizationStats = {
            totalScanned: 0,
            migratedToCloudinary: 0,
            optimizedUrls: 0,
            failed: 0
        };

        try {
            await Promise.all([
                this.processProjects(stats),
                this.processTestimonials(stats),
                this.processArticles(stats),
                this.processSiteSettings(stats),
                this.processSeoSettings(stats)
            ]);
        } catch (error) {
            logger.error({ context: "bulk-optimization", error }, "Bulk optimization failed");
            throw error;
        }

        return stats;
    }

    private static isCloudinary(url: string): boolean {
        return this.CLOUDINARY_REGEX.test(url);
    }

    private static hasOptimization(url: string): boolean {
        return url.includes(this.OPTIMIZATION_PARAMS);
    }

    private static injectOptimization(url: string): string {
        if (!this.isCloudinary(url) || this.hasOptimization(url)) return url;
        // Inject q_auto,f_auto after /upload/
        return url.replace("/upload/", `/upload/${this.OPTIMIZATION_PARAMS}/`);
    }

    private static async handleImage(url: string | null | undefined, stats: OptimizationStats): Promise<string | null> {
        if (!url) return null;
        stats.totalScanned++;

        if (!this.isCloudinary(url)) {
            try {
                // Try to migrate external image to Cloudinary
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch external image: ${response.statusText}`);

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileName = url.split('/').pop() || 'external_image';

                const uploadResult = await UploadService.uploadImage(buffer, fileName);
                stats.migratedToCloudinary++;

                // New Cloudinary URL will be optimized in the next step
                return this.injectOptimization(uploadResult.url);
            } catch (error) {
                logger.warn({ context: "bulk-optimization", url, error }, "Failed to migrate external image");
                stats.failed++;
                return url; // Keep original if migration fails
            }
        }

        if (!this.hasOptimization(url)) {
            stats.optimizedUrls++;
            return this.injectOptimization(url);
        }

        return url;
    }

    private static async processProjects(stats: OptimizationStats) {
        const projects = await projectRepository.findAllAdmin();
        for (const project of projects) {
            const newUrl = await this.handleImage(project.imageUrl, stats);
            if (newUrl && newUrl !== project.imageUrl) {
                await projectRepository.update(project.id, { imageUrl: newUrl });
            }
        }
    }

    private static async processTestimonials(stats: OptimizationStats) {
        const testimonials = await testimonialRepository.findAll();
        for (const t of testimonials) {
            const newUrl = await this.handleImage(t.avatarUrl, stats);
            if (newUrl && newUrl !== t.avatarUrl) {
                await testimonialRepository.update(t.id, { avatarUrl: newUrl });
            }
        }
    }

    private static async processArticles(stats: OptimizationStats) {
        const articles = await articleRepository.findAll();
        for (const article of articles) {
            const newUrl = await this.handleImage(article.featuredImage, stats);
            if (newUrl && newUrl !== article.featuredImage) {
                await articleRepository.update(article.id, { featuredImage: newUrl });
            }
        }
    }

    private static async processSiteSettings(stats: OptimizationStats) {
        const settings = await settingsRepository.getSettings();
        if (!settings) return;

        let updated = false;
        const newAvatar = await this.handleImage(settings.personalAvatar, stats);

        if (newAvatar && newAvatar !== settings.personalAvatar) {
            settings.personalAvatar = newAvatar;
            updated = true;
        }

        if (updated) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, updatedAt, ...updateData } = settings;
            await settingsRepository.updateSettings(updateData);
        }
    }

    private static async processSeoSettings(stats: OptimizationStats) {
        const allSeo = await seoSettingsRepository.getAll();
        for (const seo of allSeo) {
            const newUrl = await this.handleImage(seo.ogImage, stats);
            if (newUrl && newUrl !== seo.ogImage) {
                await seoSettingsRepository.update(seo.id, { ogImage: newUrl });
            }
        }
    }
}
