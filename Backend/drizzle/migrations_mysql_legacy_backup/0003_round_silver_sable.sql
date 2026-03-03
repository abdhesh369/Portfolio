CREATE TABLE `seo_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_slug` varchar(100) NOT NULL,
	`meta_title` varchar(60) NOT NULL,
	`meta_description` text NOT NULL,
	`og_title` varchar(255),
	`og_description` text,
	`og_image` varchar(500),
	`keywords` text,
	`canonical_url` varchar(500),
	`noindex` boolean DEFAULT false,
	`twitter_card` varchar(50) DEFAULT 'summary_large_image',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_settings_page_slug_unique` UNIQUE(`page_slug`)
);
