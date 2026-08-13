export const reportStats = [
  {
    id: "total-reports",
    title: "Total Reports",
    value: "247",
    description: "All generated reports",
    trend: "+12 this month",
    icon: "FileText",
  },
  {
    id: "completed",
    title: "Completed",
    value: "189",
    description: "Successfully processed",
    trend: "76.5% completion rate",
    icon: "CheckCircle",
  },
  {
    id: "pending",
    title: "Pending",
    value: "38",
    description: "Awaiting review",
    trend: "-5 from last week",
    icon: "Clock",
  },
  {
    id: "generated",
    title: "Reports Generated",
    value: "156",
    description: "This financial year",
    trend: "FY 2026/2027",
    icon: "FileChartColumnIncreasing",
  },
];

export const reportActivityData = [
  { month: "Jan", reports: 18, completed: 14, pending: 4 },
  { month: "Feb", reports: 22, completed: 17, pending: 5 },
  { month: "Mar", reports: 25, completed: 20, pending: 5 },
  { month: "Apr", reports: 19, completed: 15, pending: 4 },
  { month: "May", reports: 28, completed: 22, pending: 6 },
  { month: "Jun", reports: 24, completed: 19, pending: 5 },
  { month: "Jul", reports: 31, completed: 25, pending: 6 },
];

export const reportCategoryData = [
  { name: "Financial", value: 42, color: "#006B3C" },
  { name: "Development", value: 35, color: "#0E8A4B" },
  { name: "Citizen Services", value: 28, color: "#2D936C" },
  { name: "Complaints", value: 22, color: "#65A30D" },
  { name: "Staff", value: 18, color: "#C9A227" },
  { name: "Meetings", value: 15, color: "#047857" },
];

export const wardPerformanceData = [
  { ward: "Westlands", score: 87, projects: 12, budget: 4.2 },
  { ward: "Kangemi", score: 79, projects: 8, budget: 2.8 },
  { ward: "Kitisuru", score: 92, projects: 15, budget: 5.1 },
  { ward: "Parklands", score: 85, projects: 10, budget: 3.6 },
  { ward: "Lavington", score: 91, projects: 14, budget: 4.8 },
];

export const recentReports = [
  {
    id: 1,
    name: "Q2 Financial Summary Report",
    category: "Financial",
    period: "Apr - Jun 2026",
    generatedBy: "James Kariuki",
    date: "2026-07-15",
    status: "Completed",
    format: "PDF",
  },
  {
    id: 2,
    name: "Ward Development Projects Status",
    category: "Development",
    period: "Jul 2026",
    generatedBy: "Mary Wanjiku",
    date: "2026-07-14",
    status: "Completed",
    format: "Excel",
  },
  {
    id: 3,
    name: "Citizen Complaint Analysis",
    category: "Complaints",
    period: "Jun 2026",
    generatedBy: "Peter Mwangi",
    date: "2026-07-13",
    status: "Pending",
    format: "PDF",
  },
  {
    id: 4,
    name: "Staff Performance Review",
    category: "Staff",
    period: "Q2 2026",
    generatedBy: "Grace Njeri",
    date: "2026-07-12",
    status: "Completed",
    format: "PDF",
  },
  {
    id: 5,
    name: "Monthly Service Delivery Report",
    category: "Citizen Services",
    period: "Jun 2026",
    generatedBy: "David Ochieng",
    date: "2026-07-11",
    status: "Pending",
    format: "Excel",
  },
  {
    id: 6,
    name: "Ward Budget Utilization",
    category: "Financial",
    period: "FY 2026/2027",
    generatedBy: "James Kariuki",
    date: "2026-07-10",
    status: "Completed",
    format: "PDF",
  },
  {
    id: 7,
    name: "Community Engagement Baraza Report",
    category: "Meetings",
    period: "Jun 2026",
    generatedBy: "Mary Wanjiku",
    date: "2026-07-09",
    status: "Completed",
    format: "PDF",
  },
  {
    id: 8,
    name: "Infrastructure Development Tracker",
    category: "Development",
    period: "Q2 2026",
    generatedBy: "Peter Mwangi",
    date: "2026-07-08",
    status: "Pending",
    format: "Excel",
  },
];

export const quickReports = [
  { id: "ward-performance", label: "Ward Performance", icon: "BarChart3" },
  { id: "citizen-complaints", label: "Citizen Complaints", icon: "MessageSquareWarning" },
  { id: "development-projects", label: "Development Projects", icon: "Building2" },
  { id: "financial-summary", label: "Financial Summary", icon: "Wallet" },
  { id: "citizen-engagement", label: "Citizen Engagement", icon: "Users" },
  { id: "service-delivery", label: "Service Delivery", icon: "ClipboardCheck" },
];

export const reportTypes = [
  "Financial Summary",
  "Development Projects",
  "Citizen Complaints",
  "Staff Performance",
  "Service Delivery",
  "Budget Utilization",
  "Ward Performance",
  "Community Engagement",
];

export const departments = [
  "Administration",
  "Finance",
  "Planning",
  "Public Health",
  "Education",
  "Infrastructure",
  "Social Services",
  "Security",
];

export const periods = [
  "This Week",
  "This Month",
  "This Quarter",
  "This Financial Year",
  "Last 30 Days",
  "Last 90 Days",
  "Custom Range",
];
