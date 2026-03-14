import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  StickyNote,
  Plus,
  TrendingUp,
  BarChart3,
  Package,
  DollarSign,
  Shield,
} from "lucide-react";

export function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  const roleConfig = {
    worker: {
      name: "Worker",
      nameLocal: "कार्यकर्ता",
      color: "bg-blue-500",
      features: ["transactions", "expenses", "timeline", "notes", "inventory"],
    },
    supervisor: {
      name: "Supervisor",
      nameLocal: "पर्यवेक्षक",
      color: "bg-green-500",
      features: ["transactions", "expenses", "approvals", "timeline", "notes", "inventory", "audit"],
    },
    investor: {
      name: "Investor",
      nameLocal: "निवेशक",
      color: "bg-purple-500",
      features: ["transactions", "expenses", "approvals", "timeline", "notes", "analytics", "profit", "inventory", "financial", "audit"],
    },
  };

  const config = roleConfig[user.role];

  const allFeatures = [
    {
      id: "transactions",
      name: "Transactions",
      nameLocal: "लेनदेन",
      icon: FileText,
      path: "/transactions",
      color: "bg-orange-500",
    },
    {
      id: "expenses",
      name: "Expenses",
      nameLocal: "खर्च",
      icon: Receipt,
      path: "/expenses",
      color: "bg-red-500",
    },
    {
      id: "inventory",
      name: "Inventory",
      nameLocal: "स्टॉक",
      icon: Package,
      path: "/inventory",
      color: "bg-indigo-500",
    },
    {
      id: "approvals",
      name: "Approvals",
      nameLocal: "अनुमोदन",
      icon: CheckCircle,
      path: "/approvals",
      color: "bg-green-500",
    },
    {
      id: "timeline",
      name: "Timeline",
      nameLocal: "समयरेखा",
      icon: Clock,
      path: "/timeline",
      color: "bg-blue-500",
    },
    {
      id: "notes",
      name: "Notes",
      nameLocal: "नोट्स",
      icon: StickyNote,
      path: "/notes",
      color: "bg-purple-500",
    },
    {
      id: "financial",
      name: "Financial",
      nameLocal: "वित्तीय",
      icon: DollarSign,
      path: "/financial",
      color: "bg-emerald-500",
    },
    {
      id: "analytics",
      name: "Analytics",
      nameLocal: "विश्लेषण",
      icon: BarChart3,
      path: "/analytics",
      color: "bg-indigo-500",
    },
    {
      id: "profit",
      name: "Profit/Loss",
      nameLocal: "लाभ/हानि",
      icon: TrendingUp,
      path: "/profit",
      color: "bg-emerald-500",
    },
    {
      id: "audit",
      name: "Audit Log",
      nameLocal: "ऑडिट लॉग",
      icon: Shield,
      path: "/audit",
      color: "bg-slate-600",
    },
  ];

  const features = allFeatures.filter((f) => config.features.includes(f.id));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Different stats based on role
  const getStatsForRole = () => {
    if (user.role === "worker") {
      return [
        { label: "My Entries Today", value: "8", local: "आज की प्रविष्टियाँ" },
        { label: "Pending", value: "3", local: "लंबित" },
      ];
    } else if (user.role === "supervisor") {
      return [
        { label: "Pending Approvals", value: "12", local: "लंबित अनुमोदन" },
        { label: "Today's Total", value: "₹45K", local: "आज का कुल" },
      ];
    } else {
      return [
        { label: "Monthly Profit", value: "₹2.5L", local: "मासिक लाभ" },
        { label: "Total Invested", value: "₹50L", local: "कुल निवेश" },
      ];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${config.color} text-white p-6 rounded-b-3xl shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-90 mb-1">{config.nameLocal}</div>
            <h1 className="text-2xl">{user.name}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-white/20 rounded-xl active:scale-95 transition-transform"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow">
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.local}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => navigate(feature.path)}
              className="bg-white rounded-2xl p-6 shadow-md active:scale-95 transition-transform"
            >
              <div
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium mb-1">{feature.name}</div>
                <div className="text-xs text-gray-500">{feature.nameLocal}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button - Only for workers and supervisors */}
      {(user.role === "worker" || user.role === "supervisor") && (
        <button
          onClick={() => navigate("/transactions")}
          className={`fixed bottom-6 right-6 ${config.color} text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform`}
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}