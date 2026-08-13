import {
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  FileChartColumnIncreasing,
  FolderKanban,
  UserPlus,
  Users,
  UserCog,
} from "lucide-react";

export const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "citizens", label: "Citizens", icon: "Users" },
  { id: "complaints", label: "Complaints", icon: "Megaphone" },
  { id: "projects", label: "Development Projects", icon: "Building2" },
  { id: "meetings", label: "Meetings", icon: "CalendarDays" },
  { id: "staff", label: "Staff", icon: "BriefcaseBusiness" },
  { id: "budget", label: "Ward Budget", icon: "Wallet" },
  { id: "reports", label: "Reports", icon: "FileText" },
  { id: "settings", label: "Settings", icon: "Settings" },
  { id: "logout", label: "Logout", icon: "LogOut" },
];

export const statCards = [
  {
    id: "citizens",
    title: "Total Citizens",
    value: "12,458",
    description: "Registered ward residents",
    trend: "+3.2% from last month",
    icon: Users,
  },
  {
    id: "complaints",
    title: "Active Complaints",
    value: "43",
    description: "Open public service issues",
    trend: "-8.4% from last month",
    icon: CircleAlert,
  },
  {
    id: "projects",
    title: "Development Projects",
    value: "18",
    description: "Ongoing ward projects",
    trend: "+2 new this month",
    icon: FolderKanban,
  },
  {
    id: "meetings",
    title: "Upcoming Meetings",
    value: "5",
    description: "Scheduled in next 30 days",
    trend: "2 this week",
    icon: CalendarClock,
  },
  {
    id: "budget",
    title: "Budget Utilization",
    value: "KES 18.2M",
    description: "Current financial year spend",
    trend: "68% utilized",
    icon: FileChartColumnIncreasing,
  },
  {
    id: "completed",
    title: "Completed Projects",
    value: "56",
    description: "Successfully delivered",
    trend: "+6 this quarter",
    icon: BriefcaseBusiness,
  },
];

export const complaintTrends = [
  { month: "Jan", complaints: 52 },
  { month: "Feb", complaints: 48 },
  { month: "Mar", complaints: 57 },
  { month: "Apr", complaints: 50 },
  { month: "May", complaints: 46 },
  { month: "Jun", complaints: 43 },
];

export const projectStatusData = [
  { status: "Planned", count: 8 },
  { status: "In Progress", count: 18 },
  { status: "Completed", count: 56 },
];

export const budgetAllocationData = [
  { name: "Roads & Transport", value: 32 },
  { name: "Water & Sanitation", value: 24 },
  { name: "Health Services", value: 18 },
  { name: "Education Support", value: 16 },
  { name: "Admin & Security", value: 10 },
];

export const recentComplaints = [
  {
    id: 1,
    citizen: "Amina Hassan",
    category: "Sanitation",
    village: "Kisumu",
    priority: "High",
    status: "Pending",
    date: "2026-07-19",
  },
];

export const upcomingMeetings = [
  {
    id: 1,
    title: "Ward Development Forum",
    venue: "Makongeni",
    date: "2026-07-24",
    time: "10:00 AM",
    attendance: 120,
  },
  {
    id: 3,
    title: "Citizen Engagement Baraza",
    venue: "Kangemi Grounds",
    date: "2026-08-01",
    time: "9:30 AM",
    attendance: 200,
  },
];

export const quickActions = [
  { id: "register-citizen", label: "Register Citizen", icon: UserPlus },
  { id: "record-complaint", label: "Record Complaint", icon: CircleAlert },
  { id: "add-project", label: "Add Development Project", icon: FolderKanban },
  { id: "schedule-meeting", label: "Schedule Meeting", icon: CalendarClock },
  { id: "manage-staff", label: "Manage Staff", icon: UserCog },
  { id: "generate-report", label: "Generate Report", icon: FileChartColumnIncreasing },
];

export const recentActivities = [
  {
    id: 1,
    title: "Citizen Registered",
    description: "New resident profile added in Westlands Central.",
    time: "Today, 9:12 AM",
  },
  {
    id: 3,
    title: "Project Updated",
    description: "Kangemi water extension moved to phase II.",
    time: "Yesterday, 4:05 PM",
  },
  {
    id: 4,
    title: "Meeting Scheduled",
    description: "Budget review session added for next week.",
    time: "Yesterday, 11:18 AM",
  },
  {
    id: 5,
    title: "Budget Approved",
    description: "Emergency sanitation allocation approved.",
    time: "2 days ago",
  },
];

export const notifications = [
  { id: 1, text: "New complaint submitted in Kangemi.", level: "info" },
  { id: 2, text: "Project deadline due tomorrow: Drainage Upgrade.", level: "warning" },
  { id: 3, text: "Meeting starts today at 2:00 PM.", level: "info" },
  { id: 4, text: "Budget approval pending for roads maintenance.", level: "warning" },
];
