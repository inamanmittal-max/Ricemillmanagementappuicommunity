import { useMemo } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Card } from "./ui/card";

export function FinancialDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { transactions, expenses } = useData();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  // Only investors can access this
  if (user.role !== "investor") {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate financial metrics
  const financialData = useMemo(() => {
    // Filter approved transactions and expenses
    const approvedTransactions = transactions.filter((t) => t.status === "approved");
    const approvedExpenses = expenses.filter((e) => e.status === "approved");

    // Calculate revenue (money IN)
    const revenue = approvedTransactions
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate raw material costs (money OUT)
    const rawMaterialCosts = approvedTransactions
      .filter((t) => t.type === "out")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate operational expenses
    const operationalExpenses = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Total expenses
    const totalExpenses = rawMaterialCosts + operationalExpenses;

    // Net profit/loss
    const netProfit = revenue - totalExpenses;

    // Investor share (assuming 40% for this demo)
    const investorSharePercentage = 40;
    const investorShare = (netProfit * investorSharePercentage) / 100;

    // Monthly breakdown (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM

      const monthRevenue = approvedTransactions
        .filter((t) => t.type === "in" && t.date.startsWith(monthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      const monthRawCosts = approvedTransactions
        .filter((t) => t.type === "out" && t.date.startsWith(monthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = approvedExpenses
        .filter((e) => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
        expenses: monthRawCosts + monthExpenses,
        profit: monthRevenue - monthRawCosts - monthExpenses,
      });
    }

    // Expense breakdown by category
    const expensesByCategory = approvedExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      revenue,
      rawMaterialCosts,
      operationalExpenses,
      totalExpenses,
      netProfit,
      investorSharePercentage,
      investorShare,
      monthlyData,
      expensesByCategory,
    };
  }, [transactions, expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const categoryLabels = {
    labor: { en: "Labor", hi: "मजदूरी" },
    electricity: { en: "Electricity", hi: "बिजली" },
    maintenance: { en: "Maintenance", hi: "रखरखाव" },
    transport: { en: "Transport", hi: "परिवहन" },
    supplies: { en: "Supplies", hi: "आपूर्ति" },
    other: { en: "Other", hi: "अन्य" },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-2xl mb-1">Financial Dashboard</h1>
        <p className="text-white/90">वित्तीय डैशबोर्ड</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Financial Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Revenue */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl mb-1">
              {formatCurrency(financialData.revenue)}
            </div>
            <div className="text-sm text-green-700">Revenue</div>
            <div className="text-xs text-green-600">राजस्व</div>
          </Card>

          {/* Expenses */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl mb-1">
              {formatCurrency(financialData.totalExpenses)}
            </div>
            <div className="text-sm text-red-700">Expenses</div>
            <div className="text-xs text-red-600">खर्च</div>
          </Card>
        </div>

        {/* Net Profit/Loss */}
        <Card
          className={`p-6 ${
            financialData.netProfit >= 0
              ? "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300"
              : "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm mb-1">
                {financialData.netProfit >= 0 ? (
                  <span className="text-green-700">Net Profit / शुद्ध लाभ</span>
                ) : (
                  <span className="text-red-700">Net Loss / शुद्ध हानि</span>
                )}
              </div>
              <div className="text-4xl">
                {formatCurrency(Math.abs(financialData.netProfit))}
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                financialData.netProfit >= 0 ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {financialData.netProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-white" />
              ) : (
                <TrendingDown className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Raw Materials</div>
              <div className="font-medium">
                {formatCurrency(financialData.rawMaterialCosts)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Operational</div>
              <div className="font-medium">
                {formatCurrency(financialData.operationalExpenses)}
              </div>
            </div>
          </div>
        </Card>

        {/* Investor Share */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-purple-700 mb-1">
                Your Share ({financialData.investorSharePercentage}%)
              </div>
              <div className="text-xs text-purple-600 mb-3">
                आपका हिस्सा ({financialData.investorSharePercentage}%)
              </div>
              <div className="text-4xl text-purple-900">
                {formatCurrency(Math.abs(financialData.investorShare))}
              </div>
            </div>
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-xs text-purple-600">
            Based on {financialData.investorSharePercentage}% profit sharing agreement
          </div>
        </Card>

        {/* Expense Breakdown */}
        <div>
          <h2 className="text-lg mb-3">
            Expense Breakdown / खर्च विवरण
          </h2>
          <Card className="p-4 space-y-3">
            {Object.entries(financialData.expensesByCategory).map(([category, amount]) => {
              const percentage =
                (amount / financialData.operationalExpenses) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">
                      {categoryLabels[category as keyof typeof categoryLabels]?.en || category}
                    </div>
                    <div className="text-sm">{formatCurrency(amount)}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of operational expenses
                  </div>
                </div>
              );
            })}
            {Object.keys(financialData.expensesByCategory).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No expenses recorded yet
              </div>
            )}
          </Card>
        </div>

        {/* Monthly Performance */}
        <div>
          <h2 className="text-lg mb-3">
            Monthly Performance / मासिक प्रदर्शन
          </h2>
          <div className="space-y-2">
            {financialData.monthlyData.map((month, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div
                    className={`text-lg ${
                      month.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {month.profit >= 0 ? "+" : ""}
                    {formatCurrency(month.profit)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <ArrowDownCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="font-medium text-green-700">
                        {formatCurrency(month.revenue)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpCircle className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-600">Expenses</div>
                      <div className="font-medium text-red-700">
                        {formatCurrency(month.expenses)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
