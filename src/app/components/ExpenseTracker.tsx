import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  ArrowLeft,
  Plus,
  Camera,
  Video,
  FileImage,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  billPhoto?: "photo" | "video";
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedById: string;
  approvedBy?: string;
  time?: string;
}

export function ExpenseTracker() {
  const { user, isAuthenticated } = useAuth();
  const { expenses, addExpense } = useData();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "labor" as "labor" | "electricity" | "maintenance" | "transport" | "supplies" | "other",
    amount: "",
    description: "",
  });
  const [capturedProof, setCapturedProof] = useState<"photo" | "video" | null>(
    null
  );

  const categories = [
    { id: "labor", name: "Labor / मजदूरी", icon: "👷" },
    { id: "electricity", name: "Electricity / बिजली", icon: "⚡" },
    { id: "maintenance", name: "Maintenance / रखरखाव", icon: "🔧" },
    { id: "transport", name: "Transport / परिवहन", icon: "🚚" },
    { id: "supplies", name: "Supplies / सामग्री", icon: "📦" },
    { id: "other", name: "Other / अन्य", icon: "💰" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addExpense({
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      billPhoto: capturedProof || undefined,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: user.role === "worker" ? "pending" : "approved",
      submittedBy: user.name,
      submittedById: user.id,
    });

    setFormData({ category: "labor", amount: "", description: "" });
    setCapturedProof(null);
    setIsOpen(false);
  };

  const handleCaptureProof = (type: "photo" | "video") => {
    // In a real app, this would open camera/video capture
    // For now, just simulate capture
    setCapturedProof(type);
  };

  const categoryColors: { [key: string]: string } = {
    labor: "bg-blue-100 text-blue-700",
    electricity: "bg-yellow-100 text-yellow-700",
    maintenance: "bg-orange-100 text-orange-700",
    transport: "bg-green-100 text-green-700",
    supplies: "bg-purple-100 text-purple-700",
    other: "bg-gray-100 text-gray-700",
  };

  // Filter expenses based on role
  const visibleExpenses =
    user.role === "worker"
      ? expenses.filter((e) => e.submittedById === user.id)
      : expenses;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-red-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {(user.role === "worker" || user.role === "supervisor") && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="p-2 bg-white/20 rounded-lg active:scale-95">
                  <Plus className="w-6 h-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    New Expense / नया खर्च
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">
                      Category / श्रेणी
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              category: cat.id as typeof formData.category,
                            })
                          }
                          className={`p-4 rounded-xl border-2 ${
                            formData.category === cat.id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="text-3xl mb-2">{cat.icon}</div>
                          <div className="text-xs leading-tight">
                            {cat.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-base">
                      Amount / राशि
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="text-2xl h-14 mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-base">
                      Description / विवरण
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Details about this expense"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-2 min-h-20"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-base mb-3 block">
                      Bill Photo / बिल की फोटो (Optional)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleCaptureProof("photo")}
                        className={`p-4 rounded-xl border-2 ${
                          capturedProof === "photo"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Camera className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <div className="text-sm">Take Photo</div>
                        <div className="text-xs text-gray-600">फोटो लें</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCaptureProof("video")}
                        className={`p-4 rounded-xl border-2 ${
                          capturedProof === "video"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Video className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <div className="text-sm">Record Video</div>
                        <div className="text-xs text-gray-600">
                          वीडियो रिकॉर्ड करें
                        </div>
                      </button>
                    </div>
                    {capturedProof && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700">
                          {capturedProof === "photo" ? "Photo" : "Video"}{" "}
                          captured / कैप्चर किया गया
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      * Gallery upload disabled for security
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base">
                    Add Expense / जोड़ें
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <h1 className="text-2xl mb-1">Expenses</h1>
        <p className="text-white/90">खर्च</p>
      </div>

      {/* Summary */}
      <div className="p-6">
        <div className="bg-white rounded-2xl p-4 shadow mb-6">
          <div className="text-sm text-gray-600 mb-1">
            {user.role === "worker" ? "My Expenses" : "Total This Month"}
          </div>
          <div className="text-3xl">
            ₹
            {visibleExpenses
              .reduce((sum, exp) => sum + exp.amount, 0)
              .toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {user.role === "worker" ? "मेरे खर्चे" : "इस महीने का कुल"}
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          {visibleExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-gray-600">No expenses yet</p>
              <p className="text-sm text-gray-500">कोई खर्च नहीं</p>
            </div>
          ) : (
            visibleExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          categoryColors[expense.category] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                      </span>
                      {expense.billPhoto && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center space-x-1">
                          <FileImage className="w-3 h-3" />
                          <span>
                            {expense.billPhoto === "photo" ? "Photo" : "Video"}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {expense.time && ` • ${expense.time}`}
                    </div>
                    {user.role !== "worker" && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {expense.submittedBy}
                      </div>
                    )}
                    {expense.approvedBy && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Approved by {expense.approvedBy}
                      </div>
                    )}
                  </div>
                  <div className="text-xl text-red-600">
                    ₹{expense.amount.toLocaleString()}
                  </div>
                </div>
                {expense.status === "pending" && (
                  <div className="mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      ⏳ Pending Approval
                    </span>
                  </div>
                )}
                {expense.status === "rejected" && (
                  <div className="mt-2">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      ❌ Rejected
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}