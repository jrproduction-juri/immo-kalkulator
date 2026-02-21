CREATE TABLE `immobilien` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Mein Objekt',
	`art` enum('etw','mfh','efh','gewerbe','neubau') NOT NULL DEFAULT 'etw',
	`standort` varchar(255),
	`eingaben` json NOT NULL,
	`ergebnisse` json,
	`szenarien` json,
	`notizen` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `immobilien_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('none','basic','pro','investor','trial') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `planActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `planExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);