import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, TrendingUp, BarChart3, DollarSign, Package } from "lucide-react";

export function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only investors can access analytics
  if (user?.role !== "investor") {
    return <Navigate to="/dashboard" replace />;
  }

  const metrics = [
    {
      label: "Total Revenue",
      labelLocal: "कुल राजस्व",
      value: "₹12.5L",
      change: "+15%",
      positive: true,
      icon: DollarSign,
    },
    {
      label: "Monthly Profit",
      labelLocal: "मासिक लाभ",
      value: "₹2.5L",
      change: "+8%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Total Expenses",
      labelLocal: "कुल खर्च",
      value: "₹10L",
      change: "+12%",
      positive: false,
      icon: BarChart3,
    },
    {
      label: "Rice Processed",
      labelLocal: "चावल प्रसंस्कृत",
      value: "850 Q",
      change: "+20%",
      positive: true,
      icon: Package,
    },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 8.5, expense: 7.2 },
    { month: "Feb", revenue: 9.2, expense: 7.8 },
    { month: "Mar", revenue: 12.5, expense: 10.0 },
  ];

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
            <h1 className="text-2xl">Analytics</h1>
            <div className="text-sm opacity-90">विश्लेषण</div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 ${metric.positive ? 'bg-green-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 ${metric.positive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <span className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-xs text-gray-500">{metric.labelLocal}</div>
            </div>
          ))}
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <h2 className="text-lg mb-1">Monthly Comparison</h2>
          <p className="text-sm text-gray-600 mb-4">मासिक तुलना (Lakhs ₹)</p>
          
          <div className="space-y-3">
            {monthlyData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{data.month}</span>
                  <span className="text-gray-600">
                    Revenue: ₹{data.revenue}L | Expense: ₹{data.expense}L
                  </span>
                </div>
                <div className="flex gap-1 h-8">
                  <div
                    className="bg-green-500 rounded flex items-center justify-center text-white text-xs"
                    style={{ width: `${(data.revenue / 15) * 100}%` }}
                  >
                    {data.revenue}L
                  </div>
                  <div
                    className="bg-red-500 rounded flex items-center justify-center text-white text-xs"
                    style={{ width: `${(data.expense / 15) * 100}%` }}
                  >
                    {data.expense}L
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl p-5 shadow">
          <h2 className="text-lg mb-1">Performance Summary</h2>
          <p className="text-sm text-gray-600 mb-4">प्रदर्शन सारांश</p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-medium text-green-600">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ROI (Last 3 months)</span>
              <span className="font-medium text-green-600">15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Daily Revenue</span>
              <span className="font-medium">₹42K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Workers Active</span>
              <span className="font-medium">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
