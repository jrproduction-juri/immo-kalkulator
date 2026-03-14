ALTER TABLE `users` ADD `stripeLastWebhookEventId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeWebhookProcessedAt` timestamp;