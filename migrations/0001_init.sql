CREATE TABLE `Banner` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`image` text NOT NULL,
	`ctaText` text,
	`ctaLink` text,
	`ctaText2` text,
	`ctaLink2` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Category_slug_key` ON `Category` (`slug`);--> statement-breakpoint
CREATE TABLE `Faq` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Lead` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'QUOTE' NOT NULL,
	`fullName` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`address` text,
	`size` text,
	`categoryId` text,
	`productId` text,
	`message` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`adminNote` text,
	`source` text,
	`ipAddress` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `Lead_status_createdAt_idx` ON `Lead` (`status`,`createdAt`);--> statement-breakpoint
CREATE TABLE `Media` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`storageKey` text,
	`filename` text NOT NULL,
	`mimeType` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text,
	`uploadedById` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Partner` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo` text,
	`website` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `_PostToTag` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`A`) REFERENCES `Post`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_PostToTag_AB_unique` ON `_PostToTag` (`A`,`B`);--> statement-breakpoint
CREATE INDEX `_PostToTag_B_index` ON `_PostToTag` (`B`);--> statement-breakpoint
CREATE TABLE `Post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text DEFAULT '' NOT NULL,
	`coverImage` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`publishedAt` datetime,
	`isFeatured` integer DEFAULT false NOT NULL,
	`viewCount` integer DEFAULT 0 NOT NULL,
	`metaTitle` text,
	`metaDescription` text,
	`ogImage` text,
	`categoryId` text,
	`authorId` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Post_slug_key` ON `Post` (`slug`);--> statement-breakpoint
CREATE INDEX `Post_status_publishedAt_idx` ON `Post` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `Post_categoryId_idx` ON `Post` (`categoryId`);--> statement-breakpoint
CREATE TABLE `ProductCategory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`summary` text,
	`description` text DEFAULT '' NOT NULL,
	`highlights` text DEFAULT '[]' NOT NULL,
	`priceNote` text,
	`isFeatured` integer DEFAULT false NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`metaTitle` text,
	`metaDescription` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ProductCategory_slug_key` ON `ProductCategory` (`slug`);--> statement-breakpoint
CREATE TABLE `ProductLine` (
	`id` text PRIMARY KEY NOT NULL,
	`categoryId` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ProductLine_slug_key` ON `ProductLine` (`slug`);--> statement-breakpoint
CREATE INDEX `ProductLine_categoryId_idx` ON `ProductLine` (`categoryId`);--> statement-breakpoint
CREATE TABLE `Product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`categoryId` text NOT NULL,
	`lineId` text,
	`code` text,
	`summary` text,
	`description` text DEFAULT '' NOT NULL,
	`material` text,
	`origin` text,
	`width` text,
	`colors` text,
	`rooms` text DEFAULT '[]' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`priceFrom` integer,
	`priceTo` integer,
	`priceUnit` text DEFAULT 'M2' NOT NULL,
	`priceNote` text,
	`warrantyMonths` integer,
	`image` text,
	`gallery` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`isFeatured` integer DEFAULT false NOT NULL,
	`showInPriceTable` integer DEFAULT true NOT NULL,
	`viewCount` integer DEFAULT 0 NOT NULL,
	`metaTitle` text,
	`metaDescription` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`lineId`) REFERENCES `ProductLine`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Product_slug_key` ON `Product` (`slug`);--> statement-breakpoint
CREATE INDEX `Product_status_categoryId_idx` ON `Product` (`status`,`categoryId`);--> statement-breakpoint
CREATE INDEX `Product_lineId_idx` ON `Product` (`lineId`);--> statement-breakpoint
CREATE TABLE `Service` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text,
	`content` text DEFAULT '' NOT NULL,
	`image` text,
	`icon` text,
	`price` text,
	`duration` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Service_slug_key` ON `Service` (`slug`);--> statement-breakpoint
CREATE TABLE `Setting` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`companyName` text NOT NULL,
	`shortName` text,
	`slogan` text,
	`logo` text,
	`taxCode` text,
	`foundedYear` integer,
	`hotline` text NOT NULL,
	`zalo` text,
	`email` text,
	`address` text,
	`mapEmbedUrl` text,
	`workingHours` text,
	`facebook` text,
	`youtube` text,
	`tiktok` text,
	`messenger` text,
	`statCustomers` integer,
	`statYears` integer,
	`statProjects` integer,
	`statProducts` integer,
	`aboutShort` text,
	`aboutContent` text,
	`vision` text,
	`mission` text,
	`warrantyText` text,
	`introVideoUrl` text,
	`metaTitle` text,
	`metaDescription` text,
	`ogImage` text,
	`priceTableTitle` text,
	`priceTableEnabled` integer DEFAULT true NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Tag_slug_key` ON `Tag` (`slug`);--> statement-breakpoint
CREATE TABLE `Testimonial` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` text,
	`content` text NOT NULL,
	`avatar` text,
	`rating` integer DEFAULT 5 NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`passwordHash` text NOT NULL,
	`role` text DEFAULT 'EDITOR' NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`lastLoginAt` datetime,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);