export const settingsCategories = [
  { id: "general", label: "General Settings", icon: "Settings", description: "Ward information and system details" },
  { id: "users", label: "Users & Roles", icon: "Users", description: "Manage users and permissions" },
  { id: "notifications", label: "Notifications", icon: "Bell", description: "Configure alerts and reminders" },
  { id: "projects", label: "Project Settings", icon: "FolderKanban", description: "Configure project categories and statuses" },
  { id: "budget", label: "Budget Settings", icon: "Wallet", description: "Configure financial years, categories, and limits" },
  { id: "complaints", label: "Complaint Settings", icon: "CircleAlert", description: "Configure complaint categories, priorities, and workflows" },
  { id: "meetings", label: "Meeting Settings", icon: "CalendarDays", description: "Configure meeting preferences" },
  { id: "reports", label: "Reports & Export Settings", icon: "FileChartColumnIncreasing", description: "Configure reports and data exports" },
  { id: "security", label: "Security & Audit Logs", icon: "ShieldCheck", description: "Monitor system activity and audit records" },
  { id: "system", label: "System & Database", icon: "Database", description: "Manage backups, database status, and system health" },
];

export const generalSettings = {
  wardName: "Narok Ward",
  wardCode: "KBW-001",
  county: "Narok County",
  systemName: "Women Repsentative system",
  financialYear: "2026/2027",
  timeZone: "Africa/Nairobi (EAT)",
  email: "info@Narokcounty.go.ke",
  phone: "+254 712 345 678",
  officeAddress: "Narok, Kenya",
};

export const systemStatus = {
  system: { status: "Online", description: "All systems operational" },
  database: { status: "Connected", description: "Last backup: 2026-08-10 02:00 AM" },
  activeUsers: { value: "28", description: "Users currently active" },
  storage: { value: "62%", description: "Storage currently used" },
};

export const recentActivities = [
  { id: 1, activity: "User Login", user: "James Kariuki", details: "Admin login from 192.168.1.45", dateTime: "2026-08-10 09:15 AM", status: "Success" },
  { id: 2, activity: "Budget Updated", user: "Mary Wanjiku", details: "Q3 budget allocation modified", dateTime: "2026-08-10 08:42 AM", status: "Success" },
  { id: 3, activity: "Project Created", user: "Peter Mwangi", details: "New road rehabilitation project added", dateTime: "2026-08-10 08:30 AM", status: "Success" },
  { id: 4, activity: "Complaint Assigned", user: "Grace Njeri", details: "Complaint #1247 assigned to field officer", dateTime: "2026-08-10 08:15 AM", status: "Success" },
  { id: 5, activity: "Meeting Created", user: "David Ochieng", details: "Ward development forum scheduled", dateTime: "2026-08-09 04:20 PM", status: "Success" },
  { id: 6, activity: "Staff Updated", user: "James Kariuki", details: "Staff profile updated for John Kamau", dateTime: "2026-08-09 03:45 PM", status: "Success" },
  { id: 7, activity: "Report Generated", user: "Mary Wanjiku", details: "Financial summary report exported as PDF", dateTime: "2026-08-09 02:10 PM", status: "Success" },
  { id: 8, activity: "Settings Changed", user: "James Kariuki", details: "Notification preferences updated", dateTime: "2026-08-09 11:30 AM", status: "Success" },
];
