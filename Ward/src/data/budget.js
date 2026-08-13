export const budgetSummary = {
  approved: 185000000,
  allocated: 142000000,
  utilized: 98500000,
  remaining: 86500000,
  financialYear: "2026/2027",
  county: "Nairobi",
  status: "Active",
  health: 72,
};

export const budgetStats = [
  {
    id: "approved",
    title: "Approved Budget",
    value: "KES 185,000,000",
    description: "100% Approved",
    trend: "+2.4% vs last FY",
    icon: "Wallet",
  },
  {
    id: "allocated",
    title: "Budget Allocated",
    value: "KES 142,000,000",
    description: "76.8% Allocated",
    trend: "Across 9 departments",
    icon: "PieChart",
  },
  {
    id: "utilized",
    title: "Budget Utilized",
    value: "KES 98,500,000",
    description: "53.2% Utilized",
    trend: "+5.1% this quarter",
    icon: "TrendingUp",
  },
  {
    id: "remaining",
    title: "Remaining Balance",
    value: "KES 86,500,000",
    description: "Available Budget",
    trend: "46.8% unspent",
    icon: "Banknote",
  },
];

export const budgetCategories = [
  { name: "Administration", approved: 18500000, allocated: 14200000, utilized: 9800000 },
  { name: "Development Projects", approved: 32000000, allocated: 26000000, utilized: 18500000 },
  { name: "Roads", approved: 28000000, allocated: 22000000, utilized: 16500000 },
  { name: "Water", approved: 24000000, allocated: 19000000, utilized: 12000000 },
  { name: "Education", approved: 18000000, allocated: 14000000, utilized: 9200000 },
  { name: "Health", approved: 22000000, allocated: 17000000, utilized: 11800000 },
  { name: "Agriculture", approved: 15000000, allocated: 11000000, utilized: 7200000 },
  { name: "Security", approved: 28000000, allocated: 19000000, utilized: 16800000 },
];

export const budgetDistribution = [
  { name: "Administration", value: 10 },
  { name: "Development Projects", value: 18 },
  { name: "Roads", value: 15 },
  { name: "Water", value: 13 },
  { name: "Education", value: 10 },
  { name: "Health", value: 12 },
  { name: "Agriculture", value: 8 },
  { name: "Security", value: 14 },
];

export const budgetTable = [
  { category: "Administration", approved: 18500000, allocated: 14200000, utilized: 9800000, status: "On Track" },
  { category: "Development Projects", approved: 32000000, allocated: 26000000, utilized: 18500000, status: "On Track" },
  { category: "Roads & Infrastructure", approved: 28000000, allocated: 22000000, utilized: 16500000, status: "On Track" },
  { category: "Water Projects", approved: 24000000, allocated: 19000000, utilized: 12000000, status: "Nearing Limit" },
  { category: "Education", approved: 18000000, allocated: 14000000, utilized: 9200000, status: "Low Utilization" },
  { category: "Health", approved: 22000000, allocated: 17000000, utilized: 11800000, status: "On Track" },
  { category: "Agriculture", approved: 15000000, allocated: 11000000, utilized: 7200000, status: "Low Utilization" },
  { category: "Youth Programs", approved: 12000000, allocated: 9000000, utilized: 6800000, status: "On Track" },
  { category: "Security", approved: 28000000, allocated: 19000000, utilized: 16800000, status: "Nearing Limit" },
];

export const recentTransactions = [
  { title: "Road Construction Payment", amount: 4500000, date: "Today, 10:24 AM", type: "utilized" },
  { title: "Water Pipeline Procurement", amount: 3200000, date: "Yesterday, 3:12 PM", type: "utilized" },
  { title: "School Renovation", amount: 2800000, date: "Jul 18, 2026", type: "utilized" },
  { title: "Health Centre Equipment", amount: 1900000, date: "Jul 16, 2026", type: "utilized" },
  { title: "Youth Empowerment Funding", amount: 1450000, date: "Jul 14, 2026", type: "utilized" },
];

export const budgetAlerts = [
  { text: "Water Projects department nearing budget limit", level: "warning" },
  { text: "Low utilization warning for Education & Agriculture", level: "warning" },
  { text: "3 pending budget approvals awaiting sign-off", level: "info" },
  { text: "Budget variance of 4.2% detected in Security dept", level: "danger" },
];

export const monthlyExpenditure = [
  { month: "Jul", spent: 6800000 },
  { month: "Aug", spent: 8200000 },
  { month: "Sep", spent: 7400000 },
  { month: "Oct", spent: 9100000 },
  { month: "Nov", spent: 8600000 },
  { month: "Dec", spent: 10200000 },
  { month: "Jan", spent: 11500000 },
  { month: "Feb", spent: 9800000 },
  { month: "Mar", spent: 12600000 },
  { month: "Apr", spent: 10800000 },
  { month: "May", spent: 12100000 },
  { month: "Jun", spent: 13400000 },
];

export const departmentPerformance = [
  { name: "Administration", efficiency: 69 },
  { name: "Development Projects", efficiency: 71 },
  { name: "Roads", efficiency: 75 },
  { name: "Water", efficiency: 63 },
  { name: "Education", efficiency: 66 },
  { name: "Health", efficiency: 69 },
  { name: "Agriculture", efficiency: 65 },
  { name: "Security", efficiency: 88 },
];

export const topSpendingDepartments = [
  { name: "Development Projects", amount: 18500000 },
  { name: "Security", amount: 16800000 },
  { name: "Roads", amount: 16500000 },
  { name: "Water", amount: 12000000 },
  { name: "Health", amount: 11800000 },
];

export const leastUtilizedFunds = [
  { name: "Agriculture", amount: 7200000 },
  { name: "Youth Programs", amount: 6800000 },
  { name: "Education", amount: 9200000 },
  { name: "Administration", amount: 9800000 },
  { name: "Health", amount: 11800000 },
];
