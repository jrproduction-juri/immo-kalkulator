ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripePriceId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCurrentPeriodEnd` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `billingType` enum('monthly','yearly','lifetime');