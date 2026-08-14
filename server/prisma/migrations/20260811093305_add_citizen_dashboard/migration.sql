-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) DEFAULT NULL,
    `role` ENUM('admin', 'officer', 'staff', 'citizen') NOT NULL DEFAULT 'citizen',
    `ward` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `phone_number` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `idx_users_role`(`role`),
    INDEX `idx_users_ward`(`ward`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `villages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `ward` VARCHAR(100) NOT NULL,
    `sub_location` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `uq_villages_name_ward`(`name`, `ward`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citizens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `national_id` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `occupation` VARCHAR(100) NULL,
    `village` VARCHAR(100) NOT NULL,
    `sub_location` VARCHAR(100) NULL,
    `ward` VARCHAR(100) NOT NULL,
    `physical_address` VARCHAR(255) NULL,
    `emergency_contact` VARCHAR(20) NULL,
    `photo_url` VARCHAR(500) NULL,
    `status` ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
    `registration_date` DATE NOT NULL,
    `user_id` BIGINT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `citizens_national_id_key`(`national_id`),
    UNIQUE INDEX `citizens_user_id_key`(`user_id`),
    INDEX `idx_citizens_village`(`village`),
    INDEX `idx_citizens_ward`(`ward`),
    INDEX `idx_citizens_status`(`status`),
    INDEX `idx_citizens_name`(`last_name`, `first_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `employee_no` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `title` VARCHAR(100) NULL,
    `department` VARCHAR(100) NULL,
    `role` VARCHAR(100) NULL,
    `phone_number` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `ward` VARCHAR(100) NULL,
    `employment_date` DATE NULL,
    `status` ENUM('Active', 'On_Leave', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `staff_user_id_key`(`user_id`),
    UNIQUE INDEX `staff_employee_no_key`(`employee_no`),
    INDEX `idx_staff_department`(`department`),
    INDEX `idx_staff_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaints` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `complaint_code` VARCHAR(30) NOT NULL,
    `citizen_id` BIGINT NULL,
    `citizen_name` VARCHAR(200) NOT NULL,
    `national_id` VARCHAR(50) NULL,
    `phone_number` VARCHAR(20) NULL,
    `category` ENUM('Sanitation', 'Road_Repair', 'Water_Supply', 'Street_Lighting', 'Waste_Management', 'Health_Services', 'Education', 'Security', 'Other') NOT NULL,
    `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
    `status` ENUM('Open', 'Assigned', 'In_Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    `village` VARCHAR(100) NOT NULL,
    `assigned_officer_id` BIGINT NULL,
    `description` TEXT NOT NULL,
    `officer_notes` TEXT NULL,
    `resolution_notes` TEXT NULL,
    `date_reported` DATE NOT NULL,
    `last_updated` DATE NOT NULL,
    `resolved_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `complaints_complaint_code_key`(`complaint_code`),
    INDEX `idx_complaints_category`(`category`),
    INDEX `idx_complaints_status`(`status`),
    INDEX `idx_complaints_priority`(`priority`),
    INDEX `idx_complaints_village`(`village`),
    INDEX `idx_complaints_date`(`date_reported`),
    INDEX `idx_complaints_citizen`(`citizen_id`),
    INDEX `idx_complaints_officer`(`assigned_officer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint_communications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `complaint_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `performed_by` VARCHAR(200) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_comm_complaint`(`complaint_id`),
    INDEX `idx_comm_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint_attachments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `complaint_id` BIGINT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NULL,
    `fileSize` BIGINT NULL,
    `uploaded_by` BIGINT NULL,
    `uploaded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_att_complaint`(`complaint_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_code` VARCHAR(30) NOT NULL,
    `project_name` VARCHAR(255) NOT NULL,
    `category` ENUM('Roads_Transport', 'Water_Sanitation', 'Health_Services', 'Education_Support', 'Public_Markets', 'Street_Lighting', 'Drainage_Flood_Control', 'Community_Facilities') NOT NULL,
    `ward` VARCHAR(100) NOT NULL,
    `location` VARCHAR(255) NULL,
    `village` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `contractor_id` BIGINT NULL,
    `contractor_name` VARCHAR(200) NULL,
    `budget` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `amount_spent` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `funding_source` VARCHAR(100) NULL,
    `start_date` DATE NULL,
    `expected_completion` DATE NULL,
    `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    `project_manager_id` BIGINT NULL,
    `project_manager_name` VARCHAR(200) NULL,
    `status` ENUM('Planning', 'Approved', 'Ongoing', 'Delayed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Planning',
    `progress` SMALLINT NOT NULL DEFAULT 0,
    `financial_year` VARCHAR(20) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `projects_project_code_key`(`project_code`),
    INDEX `idx_projects_category`(`category`),
    INDEX `idx_projects_status`(`status`),
    INDEX `idx_projects_priority`(`priority`),
    INDEX `idx_projects_ward`(`ward`),
    INDEX `idx_projects_contractor`(`contractor_id`),
    INDEX `idx_projects_manager`(`project_manager_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_milestones` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('Pending', 'Ongoing', 'Completed', 'Delayed', 'Cancelled', 'On_Track') NOT NULL DEFAULT 'Pending',
    `completed_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_milestone_project`(`project_id`),
    INDEX `idx_milestone_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_updates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `update_text` TEXT NOT NULL,
    `updated_by` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_update_project`(`project_id`),
    INDEX `idx_update_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_budget_updates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `item` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `type` ENUM('utilized', 'returned', 'allocated') NOT NULL DEFAULT 'utilized',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_project_budget_project`(`project_id`),
    INDEX `idx_project_budget_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_documents` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `document_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NULL,
    `file_type` VARCHAR(50) NULL,
    `uploaded_by` BIGINT NULL,
    `uploaded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_doc_project`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_activities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `performed_by` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_activity_project`(`project_id`),
    INDEX `idx_activity_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_comments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `author` VARCHAR(200) NOT NULL,
    `date` DATE NOT NULL,
    `comment_text` TEXT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_comment_project`(`project_id`),
    INDEX `idx_comment_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_code` VARCHAR(30) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('Ward_Development_Committee', 'Public_Baraza', 'Budget_Review', 'Planning_Session', 'Town_Hall', 'Project_Steering_Committee', 'Health_Sanitation_Forum', 'Education_Committee', 'Security_Committee', 'Water_Environment_Committee') NOT NULL,
    `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
    `status` ENUM('Scheduled', 'In_Progress', 'Completed', 'Postponed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    `date` DATE NOT NULL,
    `time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `venue` VARCHAR(255) NOT NULL,
    `village` VARCHAR(100) NULL,
    `chairperson` VARCHAR(200) NULL,
    `secretary` VARCHAR(200) NULL,
    `organizer` VARCHAR(200) NULL,
    `expected_attendance` INTEGER NOT NULL DEFAULT 0,
    `actual_attendance` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `meetings_meeting_code_key`(`meeting_code`),
    INDEX `idx_meetings_type`(`type`),
    INDEX `idx_meetings_status`(`status`),
    INDEX `idx_meetings_date`(`date`),
    INDEX `idx_meetings_village`(`village`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_agenda` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_id` BIGINT NOT NULL,
    `item_order` INTEGER NOT NULL DEFAULT 0,
    `item` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_agenda_meeting`(`meeting_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_minutes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_id` BIGINT NOT NULL,
    `item_order` INTEGER NOT NULL DEFAULT 0,
    `minute_text` TEXT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_minutes_meeting`(`meeting_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_action_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_id` BIGINT NOT NULL,
    `item` VARCHAR(255) NOT NULL,
    `owner` VARCHAR(200) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('Pending', 'In_Progress', 'Completed', 'Overdue') NOT NULL DEFAULT 'Pending',
    `completed_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_action_meeting`(`meeting_id`),
    INDEX `idx_action_status`(`status`),
    INDEX `idx_action_due`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_attendance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_id` BIGINT NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `role` VARCHAR(100) NULL,
    `present` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_attendance_meeting`(`meeting_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_activities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `meeting_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `performed_by` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_meeting_activity`(`meeting_id`),
    INDEX `idx_meeting_activity_date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ward_budget` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `financial_year` VARCHAR(20) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `allocated_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `spent_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `project_id` BIGINT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `idx_ward_budget_year`(`financial_year`),
    INDEX `idx_ward_budget_category`(`category`),
    INDEX `idx_ward_budget_project`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_name` VARCHAR(255) NOT NULL,
    `report_type` ENUM('Citizens', 'Complaints', 'Projects', 'Meetings', 'Budget', 'Staff', 'Custom') NOT NULL,
    `report_format` ENUM('PDF', 'Excel', 'CSV', 'HTML') NOT NULL DEFAULT 'PDF',
    `parameters` TEXT NULL,
    `generated_by` BIGINT NULL,
    `file_path` VARCHAR(500) NULL,
    `generated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_reports_type`(`report_type`),
    INDEX `idx_reports_generated`(`generated_at`),
    INDEX `idx_reports_by`(`generated_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `public_id` VARCHAR(255) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `secure_url` VARCHAR(500) NOT NULL,
    `format` VARCHAR(50) NULL,
    `resource_type` VARCHAR(50) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `bytes` BIGINT NULL,
    `original_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(100) NULL,
    `uploaded_by` BIGINT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `media_public_id_key`(`public_id`),
    INDEX `idx_media_public_id`(`public_id`),
    INDEX `idx_media_uploaded_by`(`uploaded_by`),
    INDEX `idx_media_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `setting_type` VARCHAR(50) NOT NULL DEFAULT 'text',
    `description` VARCHAR(255) NULL,
    `is_editable` BOOLEAN NOT NULL DEFAULT true,
    `updated_by` BIGINT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `system_settings_setting_key_key`(`setting_key`),
    INDEX `idx_settings_key`(`setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_activities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(255) NOT NULL,
    `user_id` BIGINT NULL,
    `user_name` VARCHAR(200) NOT NULL,
    `details` TEXT NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` VARCHAR(500) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Success',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_activity_user`(`user_id`),
    INDEX `idx_activity_type`(`activity`),
    INDEX `idx_activity_date`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('General', 'Road_Maintenance', 'Water_Service', 'Health_Campaign', 'Public_Participation', 'Community_Event', 'Emergency', 'Other') NOT NULL DEFAULT 'General',
    `ward` VARCHAR(100) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(6) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `idx_announcements_ward`(`ward`),
    INDEX `idx_announcements_category`(`category`),
    INDEX `idx_announcements_published`(`is_published`),
    INDEX `idx_announcements_created`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` ENUM('Complaint_Update', 'Meeting_Reminder', 'Project_Update', 'Announcement', 'System') NOT NULL DEFAULT 'System',
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `related_id` BIGINT NULL,
    `related_type` VARCHAR(50) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_notifications_user`(`user_id`),
    INDEX `idx_notifications_read`(`is_read`),
    INDEX `idx_notifications_created`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `citizens` ADD CONSTRAINT `citizens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `staff_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_citizen_id_fkey` FOREIGN KEY (`citizen_id`) REFERENCES `citizens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_assigned_officer_id_fkey` FOREIGN KEY (`assigned_officer_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint_communications` ADD CONSTRAINT `complaint_communications_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint_attachments` ADD CONSTRAINT `complaint_attachments_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_project_manager_id_fkey` FOREIGN KEY (`project_manager_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_milestones` ADD CONSTRAINT `project_milestones_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_updates` ADD CONSTRAINT `project_updates_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_budget_updates` ADD CONSTRAINT `project_budget_updates_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_activities` ADD CONSTRAINT `project_activities_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_comments` ADD CONSTRAINT `project_comments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_agenda` ADD CONSTRAINT `meeting_agenda_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_minutes` ADD CONSTRAINT `meeting_minutes_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_action_items` ADD CONSTRAINT `meeting_action_items_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_attendance` ADD CONSTRAINT `meeting_attendance_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_activities` ADD CONSTRAINT `meeting_activities_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ward_budget` ADD CONSTRAINT `ward_budget_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
