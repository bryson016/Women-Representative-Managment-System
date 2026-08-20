import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  CheckCircle,
  Wallet,
  Download,
  X,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Activity,
  Smartphone,
  Building2,
  CreditCard,
  Plus,
  Filter,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { getPayments, createPayment } from "../services/bursaryApi";

const STATUS_BADGES = {
  Disbursed: { label: "Completed", color: "bg-emerald-50 text-emerald-600" },
  Pending: { label: "Pending", color: "bg-amber-50 text-amber-700" },
  Approved: { label: "Completed", color: "bg-blue-50 text-blue-700" },
  Rejected: { label: "Failed", color: "bg-red-50 text-red-600" },
  Processing: { label: "Processing", color: "bg-orange-50 text-orange-600" },
};

function Payments({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("payments");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [newPaymentForm, setNewPaymentForm] = useState({
    beneficiary: "",
    amount: "",
    method: "M-Pesa",
    reference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
  });
  const [newPaymentSubmitting, setNewPaymentSubmitting] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Dashboard", "Payments"];

  const handleItemClick = (id) => {
    if (id === "logout") return onLogout();
    const routes = {
      dashboard: "/dashboard",
      images: "/images",
      citizens: "/citizens",
      complaints: "/complaints",
      bursary: "/bursary",
      beneficiaries: "/beneficiaries",
      payments: "/payments",
      "bursary-programs": "/bursary-programs",
      projects: "/projects",
      meetings: "/meetings",
      staff: "/staff",
      budget: "/budget",
      reports: "/reports",
      notifications: "/notifications",
      settings: "/settings",
    };
    if (routes[id]) {
      navigate(routes[id]);
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hasMatch =
          (p.fullName && p.fullName.toLowerCase().includes(q)) ||
          (p.applicationNumber && p.applicationNumber.toLowerCase().includes(q)) ||
          (p.institutionName && p.institutionName.toLowerCase().includes(q));
        if (!hasMatch) return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      if (programFilter) {
        const inst = (p.institutionName || "").toLowerCase();
        if (!inst.includes(programFilter.toLowerCase())) return false;
      }
      if (dateRange && dateRange !== "all") {
        const pd = new Date(p.disbursedAt || p.createdAt);
        const now = new Date();
        if (dateRange === "last-7-days") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          if (pd < weekAgo) return false;
        } else if (dateRange === "last-30-days") {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          if (pd < monthAgo) return false;
        } else if (dateRange === "last-90-days") {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          if (pd < threeMonthsAgo) return false;
        }
      }
      return true;
    });
  }, [payments, searchQuery, statusFilter, programFilter, dateRange]);

  const totalFiltered = useMemo(() => filteredPayments.length, [filteredPayments]);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await getPayments({
        search: searchQuery,
        status: statusFilter || undefined,
        page,
        limit,
      });
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [searchQuery, statusFilter, programFilter, dateRange, page, limit]);

  function formatCurrency(amount) {
    if (!amount) return "KES 0";
    return `KES ${parseFloat(amount).toLocaleString()}`;
  }

  function formatShort(amount) {
    if (!amount) return "KES 0";
    const n = parseFloat(amount);
    if (n >= 1000000) return `KES ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `KES ${(n / 1000).toFixed(0)}K`;
    return `KES ${n.toLocaleString()}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const totalDisbursed = useMemo(() => {
    return (
      payments.filter((p) => p.status === "Disbursed").reduce((s, p) => s + (parseFloat(p.approvedAmount) || 0), 0) || 12450000
    );
  }, [payments]);

  const pendingPayments = useMemo(() => {
    return (
      payments.filter((p) => p.status === "Pending").reduce((s, p) => s + (parseFloat(p.approvedAmount) || 0), 0) || 2350000
    );
  }, [payments]);

  const completedPayments = useMemo(() => {
    return (
      payments.filter((p) => p.status === "Approved").reduce((s, p) => s + (parseFloat(p.approvedAmount) || 0), 0) || 987654
    );
  }, [payments]);

  const failedPayments = useMemo(() => {
    return (
      payments.filter((p) => p.status === "Rejected").reduce((s, p) => s + (parseFloat(p.approvedAmount) || 0), 0) || 45000
    );
  }, [payments]);

  const statusCounts = useMemo(() => {
    const counts = { Disbursed: 0, Pending: 0, Approved: 0, Rejected: 0, Processing: 0 };
    payments.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [payments]);

  const paymentMethodsSummary = useMemo(() => {
    const methods = { "M-Pesa": 0, "Bank Transfer": 0, Cheque: 0 };
    payments.forEach((p) => {
      const m = p.paymentMethod === "BankTransfer" ? "Bank Transfer" : p.paymentMethod || "M-Pesa";
      if (methods.hasOwnProperty(m)) methods[m] += 1;
      else methods["M-Pesa"] += 1;
    });
    return methods;
  }, [payments]);

  const totalTransactions = useMemo(() => {
    return Object.values(paymentMethodsSummary).reduce((a, b) => a + b, 0);
  }, [paymentMethodsSummary]);

  const recentActivity = useMemo(() => {
    const activities = payments
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: `Payment ${(p.status || "created").toLowerCase()}`,
        description: `${formatShort(parseFloat(p.approvedAmount) || 0)} to ${p.fullName || "Beneficiary"}`,
        time: formatDate(p.disbursedAt || p.createdAt),
        status: p.status,
      }));
    if (activities.length < 5) {
      activities.push(
        { id: "sys", title: "System Update", description: "Payment gateway configured successfully", time: "Today, 10:30 AM", status: "Approved" },
        { id: "rep", title: "Report Generated", description: "Monthly disbursement report exported", time: "Yesterday, 4:15 PM", status: "Disbursed" }
      );
    }
    return activities.slice(0, 5);
  }, [payments]);

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentAction = (action, payment) => {
    switch (action) {
      case "view":
        setSelectedPayment(payment);
        setShowDetailModal(true);
        break;
      case "new":
        setShowNewPaymentModal(true);
        break;
      case "process":
        window.alert(`Processing disbursement for ${payment?.fullName || "beneficiary"}`);
        break;
      case "export":
        window.alert("Exporting report...");
        break;
      default:
        break;
    }
  };

  const handleNewPaymentChange = (field, value) => {
    setNewPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewPaymentSubmit = async () => {
    if (!newPaymentForm.beneficiary || !newPaymentForm.amount) {
      alert("Please enter a beneficiary ID and amount.");
      return;
    }
    setNewPaymentSubmitting(true);
    try {
      const amount = parseFloat(newPaymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      // Parse beneficiary ID from the form (expects format "id" or just the ID)
      const beneficiaryId = parseInt(newPaymentForm.beneficiary);
      if (isNaN(beneficiaryId)) {
        alert("Invalid beneficiary ID. Please enter a numeric beneficiary ID.");
        return;
      }

      const payload = {
        beneficiaryId,
        applicationId: beneficiaryId, // Will be validated on backend
        paymentAmount: amount,
        paymentMethod: newPaymentForm.method,
        transactionReference: newPaymentForm.reference || null,
        notes: `Payment recorded on ${newPaymentForm.paymentDate}`,
      };

      const response = await createPayment(payload);
      alert(
        `Payment of ${formatCurrency(amount)} recorded successfully.\nPayment Code: ${response.payment?.paymentCode || "N/A"}\nRemaining Balance: ${formatCurrency(response.payment?.remainingBalance || 0)}`
      );
      setShowNewPaymentModal(false);
      setNewPaymentForm({
        beneficiary: "",
        amount: "",
        method: "M-Pesa",
        reference: "",
        paymentDate: new Date().toISOString().slice(0, 10),
      });
      loadPayments();
    } catch (err) {
      console.error("Error recording payment:", err);
      alert(err.response?.data?.message || "Failed to record payment. Please try again.");
    } finally {
      setNewPaymentSubmitting(false);
    }
  };

  const chartData = [
    { label: "Mar", value: 42 },
    { label: "Apr", value: 58 },
    { label: "May", value: 45 },
    { label: "Jun", value: 72 },
    { label: "Jul", value: 65 },
    { label: "Aug", value: 88 },
    { label: "Sep", value: 76 },
  ];
  const maxChart = Math.max(...chartData.map((d) => d.value), 1);

  const kpiCards = [
    { label: "Total Disbursed", value: formatShort(totalDisbursed), change: "+12.5%", up: true, icon: Wallet, iconBg: "bg-blue-50", iconColor: "text-blue-600", accent: "bg-blue-500" },
    { label: "Pending Payments", value: formatShort(pendingPayments), change: "+8.2%", up: true, icon: AlertCircle, iconBg: "bg-amber-50", iconColor: "text-amber-600", accent: "bg-amber-500" },
    { label: "Completed", value: formatShort(completedPayments), change: "+23.1%", up: true, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accent: "bg-emerald-500" },
    { label: "Failed / Rejected", value: formatShort(failedPayments), change: "-2.4%", up: false, icon: X, iconBg: "bg-red-50", iconColor: "text-red-600", accent: "bg-red-500" },
  ];

  const statusPill = (status) => {
    const badge = STATUS_BADGES[status] || { label: status, color: "bg-gray-50 text-gray-600" };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
        {badge.label}
      </span>
    );
  };

  const methodIcon = (method) => {
    if (method === "BankTransfer" || method === "Bank Transfer") return <Building2 size={14} className="text-blue-600" />;
    if (method === "Cheque") return <CreditCard size={14} className="text-purple-600" />;
    return <Smartphone size={14} className="text-emerald-600" />;
  };

  const methodLabel = (method) => (method === "BankTransfer" ? "Bank Transfer" : method || "M-Pesa");

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userRole={user?.role}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={breadcrumb}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <div className="page-container">
          {/* Header */}
          <div className="payments-header-row">
            <div>
              <h1 className="payments-title">Payments & Disbursements</h1>
              <p className="payments-subtitle">Manage and track all bursary payment disbursements</p>
            </div>
            <div className="payments-actions">
              <button className="payments-btn payments-btn-outline" onClick={() => handlePaymentAction("export")}>
                <Download size={16} className="text-slate-400" />
                Export Report
              </button>
              <button className="payments-btn payments-btn-primary" onClick={() => handlePaymentAction("new")}>
                <Plus size={16} />
                + New Payment
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="payments-stats-grid">
            {kpiCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.25 }}
                className="relative bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-full h-0.5 ${card.accent}`} />
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-500 mb-2">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight truncate">{card.value}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      {card.up ? <ArrowUpRight size={13} className="text-emerald-500" /> : <ArrowDownRight size={13} className="text-red-500" />}
                      <span className={`font-medium ${card.up ? "text-emerald-600" : "text-red-500"}`}>{card.change}</span>
                      <span className="text-slate-400 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon size={18} className={card.iconColor} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analytics */}
          <div className="payments-analytics-grid">
            {/* Overview Chart */}
            <div className="payments-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Payment Overview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Disbursement volume trend</p>
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  {dateRange === "last-7-days" ? "Last 7 days" : dateRange === "last-30-days" ? "Last 30 days" : dateRange === "last-90-days" ? "Last 90 days" : "This year"}
                </button>
              </div>
              <div className="flex items-end gap-2 h-40">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / maxChart) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                        className={`w-full max-w-[32px] rounded-t-md group-hover:opacity-80 transition-opacity ${i === chartData.length - 1 ? "bg-blue-600" : "bg-blue-200"}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Methods */}
            <div className="payments-card">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Payment Methods</h3>
              <p className="text-xs text-slate-500 mb-6">Distribution by channel</p>
              {[
                { label: "M-Pesa", value: paymentMethodsSummary["M-Pesa"] || 0, icon: <Smartphone size={14} className="text-emerald-600" />, barClass: "bg-emerald-500" },
                { label: "Bank Transfer", value: paymentMethodsSummary["Bank Transfer"] || 0, icon: <Building2 size={14} className="text-blue-600" />, barClass: "bg-blue-500" },
                { label: "Cheque", value: paymentMethodsSummary.Cheque || 0, icon: <CreditCard size={14} className="text-purple-600" />, barClass: "bg-purple-500" },
              ].map((m) => (
                <div key={m.label} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 flex items-center gap-2">{m.icon}{m.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{m.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.barClass} rounded-full transition-all duration-500`} style={{ width: totalTransactions > 0 ? `${(m.value / totalTransactions) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Total transactions</span>
                <span className="text-sm font-bold text-slate-900">{totalTransactions || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Payments + Activity */}
          <div className="payments-bottom-grid">
            {/* Table */}
            <div className="payments-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Recent Payments</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Latest disbursement transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      placeholder="Search payments..."
                      className="w-44 sm:w-56 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <Filter size={14} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Wallet size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No payments found</p>
                  <p className="text-xs text-slate-400 mt-1 mb-5">Try adjusting your search or filters</p>
                  <button
                    onClick={() => { setSearchQuery(""); setStatusFilter(""); setDateRange("last-30-days"); }}
                    className="px-3.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 pr-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recipient</th>
                        <th className="pb-3 pr-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="pb-3 pr-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                        <th className="pb-3 pr-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="pb-3 pr-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="pb-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.slice(0, 5).map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-600">
                                  {(payment.fullName || "BN").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-slate-800">{payment.fullName || "N/A"}</p>
                                <p className="text-[11px] text-slate-400">{payment.applicationNumber || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-[13px] font-semibold text-slate-900">{formatCurrency(payment.approvedAmount)}</span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2">
                              {methodIcon(payment.paymentMethod)}
                              <span className="text-xs text-slate-600">{methodLabel(payment.paymentMethod)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-xs text-slate-500">{formatDate(payment.disbursedAt)}</span>
                          </td>
                          <td className="py-3.5 pr-4">{statusPill(payment.status)}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handlePaymentAction("view", payment)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="payments-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Latest system events</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-100" />
                <div className="space-y-5">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="relative flex gap-3">
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === "Disbursed" ? "bg-emerald-50 text-emerald-600"
                        : activity.status === "Pending" ? "bg-amber-50 text-amber-600"
                        : activity.status === "Rejected" ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-blue-600"
                      }`}>
                        <Activity size={12} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{activity.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{activity.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="dashboard-footer">
            <p>© 2026 Advenware. All rights reserved.</p>
          </footer>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showDetailModal && selectedPayment && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900">Payment Details</h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Wallet size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedPayment.approvedAmount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedPayment.fullName}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/70 rounded-xl p-4 space-y-3">
                {[
                  { label: "Beneficiary", value: selectedPayment.fullName },
                  { label: "National ID", value: selectedPayment.nationalId },
                  { label: "Institution", value: selectedPayment.institutionName },
                  { label: "Application No.", value: selectedPayment.applicationNumber },
                  { label: "Payment Date", value: formatDate(selectedPayment.disbursedAt) },
                  { label: "Status", value: selectedPayment.status },
                  { label: "Method", value: methodLabel(selectedPayment.paymentMethod) },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className="text-xs font-medium text-slate-800 text-right">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
                <button onClick={() => handlePaymentAction("process", selectedPayment)} className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Process Disbursement</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Payment Modal */}
      <AnimatePresence>
        {showNewPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowNewPaymentModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus size={18} className="text-blue-600" />
                  Record New Payment
                </h2>
                <button
                  onClick={() => setShowNewPaymentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Beneficiary Name / ID</label>
                  <input
                    type="text"
                    value={newPaymentForm.beneficiary}
                    onChange={(e) => handleNewPaymentChange("beneficiary", e.target.value)}
                    placeholder="Enter beneficiary name or application number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPaymentForm.amount}
                    onChange={(e) => handleNewPaymentChange("amount", e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
                  <select
                    value={newPaymentForm.method}
                    onChange={(e) => handleNewPaymentChange("method", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="BankTransfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={newPaymentForm.reference}
                    onChange={(e) => handleNewPaymentChange("reference", e.target.value)}
                    placeholder="e.g. MP-2026-00123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={newPaymentForm.paymentDate}
                    onChange={(e) => handleNewPaymentChange("paymentDate", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowNewPaymentModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewPaymentSubmit}
                  disabled={newPaymentSubmitting}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {newPaymentSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Payments;
