CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`targetId` int,
	`path` varchar(500) NOT NULL,
	`browser` varchar(100),
	`os` varchar(100),
	`device` varchar(50),
	`country` varchar(100),
	`city` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mindset` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(100) NOT NULL DEFAULT 'Brain',
	`tags` json NOT NULL,
	CONSTRAINT `mindset_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_skill_id` varchar(100) NOT NULL,
	`to_skill_id` varchar(100) NOT NULL,
	CONSTRAINT `skill_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `techStack` json NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `displayOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `status` varchar(50) DEFAULT 'Completed' NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `status` varchar(100) DEFAULT 'Core' NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `description` text DEFAULT ('') NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `proof` text DEFAULT ('') NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `x` float DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `y` float DEFAULT 50 NOT NULL;