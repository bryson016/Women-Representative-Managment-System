import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, CalendarDays, Landmark, Wallet } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import BudgetStats from "../components/budget/BudgetStats";
import BudgetCharts from "../components/budget/BudgetCharts";
import BudgetTable from "../components/budget/BudgetTable";
import BudgetSidebar from "../components/budget/BudgetSidebar";
import BudgetInsights from "../components/budget/BudgetInsights";
import {
  budgetSummary,
  budgetStats,
  budgetCategories,
  budgetDistribution,
  budgetTable,
  recentTransactions,
  budgetAlerts,
  monthlyExpenditure,
  departmentPerformance,
  topSpendingDepartments,
  leastUtilizedFunds,
} from "../data/budget";

function Budget({ onLogout }) {
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState("budget");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-KE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const handleItemClick = useCallback(
    (id) => {
      if (id === "logout") {
        onLogout();
        return;
      }
      if (id === "dashboard") {
        navigate("/dashboard");
        return;
      }
      if (id === "images") {
        navigate("/images");
        return;
      }
      if (id === "citizens") {
        navigate("/citizens");
        return;
      }
      if (id === "complaints") {
        navigate("/complaints");
        return;
      }
      if (id === "bursary") {
        navigate("/bursary");
        return;
      }
      if (id === "beneficiaries") {
        navigate("/beneficiaries");
        return;
      }
      if (id === "payments") {
        navigate("/payments");
        return;
      }
      if (id === "bursary-programs") {
        navigate("/bursary-programs");
        return;
      }
      if (id === "projects") {
        navigate("/projects");
        return;
      }
      if (id === "meetings") {
        navigate("/meetings");
        return;
      }
      if (id === "staff") {
        navigate("/staff");
        return;
      }
      if (id === "budget") {
        navigate("/budget");
        return;
      }
      if (id === "reports") {
        navigate("/reports");
        return;
      }
      if (id === "notifications") {
        navigate("/notifications");
        return;
      }
      if (id === "settings") {
        navigate("/settings");
        return;
      }
      setActiveItem(id);
      setMobileOpen(false);
    },
    [navigate, onLogout]
  );

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={["Dashboard", "Ward Budget"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner budget-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Ward Budget Dashboard</h1>
            <h2>Plan, allocate, monitor, and manage ward financial resources with complete transparency and accountability.</h2>
            <div className="ward-meta">
              <span>
                <CalendarDays size={14} />
                Financial Year: {budgetSummary.financialYear}
              </span>
              <span>
                <Landmark size={14} />
                County: {budgetSummary.county}
              </span>
              <span>
                <Activity size={14} />
                Budget Status: {budgetSummary.status}
              </span>
            </div>
          </div>

          {/* Floating Budget Health Card */}
          <div className="budget-health-card">
            <div className="budget-health-head">
              <Wallet size={16} />
              <span>Budget Health</span>
            </div>
            <div className="budget-health-value">{budgetSummary.health}%</div>
            <div className="budget-health-status">Status: Healthy</div>
            <p>Budget execution is on track.</p>
          </div>
        </motion.section>

        <BudgetStats stats={budgetStats} />

        <BudgetCharts
          categories={budgetCategories}
          distribution={budgetDistribution}
          summary={budgetSummary}
        />

        <BudgetTable data={budgetTable} />

        <BudgetSidebar transactions={recentTransactions} alerts={budgetAlerts} />

        <BudgetInsights
          monthly={monthlyExpenditure}
          performance={departmentPerformance}
          topSpending={topSpendingDepartments}
          leastUtilized={leastUtilizedFunds}
        />

        <footer className="dashboard-footer">
          <p>Women Repsentative system</p>
          <p>© 2026 Advanware. All rights reserved.</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default Budget;
