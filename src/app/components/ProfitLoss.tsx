import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";

export function ProfitLoss() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only investors can access profit/loss
  if (user?.role !== "investor") {
    return <Navigate to="/dashboard" replace />;
  }

  const profitData = {
    monthly: {
      period: "March 2026",
      periodLocal: "मार्च 2026",
      revenue: 12.5,
      expenses: 10.0,
      profit: 2.5,
      profitPercentage: 20,
      breakdown: [
        { category: "Rice Sales", categoryLocal: "चावल बिक्री", amount: 12.5, type: "revenue" },
        { category: "Raw Material", categoryLocal: "कच्चा माल", amount: 6.5, type: "expense" },
        { category: "Labor Costs", categoryLocal: "श्रम लागत", amount: 2.0, type: "expense" },
        { category: "Utilities", categoryLocal: "उपयोगिताएँ", amount: 0.8, type: "expense" },
        { category: "Maintenance", categoryLocal: "रखरखाव", amount: 0.7, type: "expense" },
      ],
    },
    quarterly: {
      period: "Q1 2026",
      periodLocal: "तिमाही 1 2026",
      revenue: 30.2,
      expenses: 25.0,
      profit: 5.2,
      profitPercentage: 17.2,
      breakdown: [
        { category: "Rice Sales", categoryLocal: "चावल बिक्री", amount: 30.2, type: "revenue" },
        { category: "Raw Material", categoryLocal: "कच्चा माल", amount: 16.5, type: "expense" },
        { category: "Labor Costs", categoryLocal: "श्रम लागत", amount: 5.5, type: "expense" },
        { category: "Utilities", categoryLocal: "उपयोगिताएँ", amount: 2.0, type: "expense" },
        { category: "Maintenance", categoryLocal: "रखरखाव", amount: 1.0, type: "expense" },
      ],
    },
    yearly: {
      period: "2025",
      periodLocal: "2025",
      revenue: 98.5,
      expenses: 82.0,
      profit: 16.5,
      profitPercentage: 16.8,
      breakdown: [
        { category: "Rice Sales", categoryLocal: "चावल बिक्री", amount: 98.5, type: "revenue" },
        { category: "Raw Material", categoryLocal: "कच्चा माल", amount: 52.0, type: "expense" },
        { category: "Labor Costs", categoryLocal: "श्रम लागत", amount: 18.0, type: "expense" },
        { category: "Utilities", categoryLocal: "उपयोगिताएँ", amount: 7.0, type: "expense" },
        { category: "Maintenance", categoryLocal: "रखरखाव", amount: 5.0, type: "expense" },
      ],
    },
  };

  const data = profitData[selectedPeriod];
  const isProfit = data.profit > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-purple-500 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-xl active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl">Profit & Loss</h1>
            <div className="text-sm opacity-90">लाभ और हानि</div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(["monthly", "quarterly", "yearly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors ${
                selectedPeriod === period
                  ? "bg-white text-purple-500"
                  : "bg-white/20 text-white"
              }`}
            >
              {period === "monthly" && "Monthly"}
              {period === "quarterly" && "Quarterly"}
              {period === "yearly" && "Yearly"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Period Header */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{data.period}</span>
          <span className="text-sm">({data.periodLocal})</span>
        </div>

        {/* Summary Card */}
        <div className={`${isProfit ? 'bg-green-500' : 'bg-red-500'} text-white rounded-2xl p-6 shadow-lg`}>
          <div className="flex items-center gap-2 mb-2">
            {isProfit ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
            <span className="text-sm opacity-90">
              {isProfit ? "Net Profit" : "Net Loss"}
            </span>
          </div>
          <div className="text-4xl mb-1">₹{Math.abs(data.profit)}L</div>
          <div className="text-sm opacity-90">
            {data.profitPercentage.toFixed(1)}% of Revenue
          </div>
        </div>

        {/* Revenue & Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl mb-1 text-green-600">₹{data.revenue}L</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-gray-500">कुल राजस्व</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl mb-1 text-red-600">₹{data.expenses}L</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-xs text-gray-500">कुल खर्च</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <h2 className="text-lg mb-1">Breakdown</h2>
          <p className="text-sm text-gray-600 mb-4">विवरण (in Lakhs ₹)</p>

          <div className="space-y-3">
            {data.breakdown.map((item, idx) => (
              <div key={idx} className="border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-800">{item.category}</div>
                    <div className="text-xs text-gray-500">{item.categoryLocal}</div>
                  </div>
                  <div className={`text-lg font-medium ${
                    item.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.type === 'revenue' ? '+' : '-'}₹{item.amount}L
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.type === 'revenue' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(item.amount / Math.max(data.revenue, data.expenses)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All figures are in Indian Rupees (Lakhs). This is mock data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
