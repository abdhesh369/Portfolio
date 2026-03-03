CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(200) NOT NULL,
	`organization` varchar(200) NOT NULL,
	`period` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`type` varchar(100) NOT NULL DEFAULT 'Experience',
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL DEFAULT '',
	`message` text NOT NULL,
	`createdAt` varchar(100) NOT NULL DEFAULT '2026-01-07T15:58:45.102Z',
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`techStack` text NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`githubUrl` varchar(500),
	`liveUrl` varchar(500),
	`category` varchar(100) NOT NULL,
	`problemStatement` text,
	`motivation` text,
	`systemDesign` text,
	`challenges` text,
	`learnings` text,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	`icon` varchar(100) NOT NULL DEFAULT 'Code',
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
