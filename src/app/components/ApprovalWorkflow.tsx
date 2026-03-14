import { useState, useEffect, useMemo } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { ArrowLeft, Check, X, FileImage, Calendar, Truck } from "lucide-react";
import { Button } from "./ui/button";

interface PendingItem {
  id: string;
  type: "transaction" | "expense";
  submittedBy: string;
  amount: number;
  description: string;
  category?: string;
  truckNumber?: string;
  weight?: number;
  date: string;
  time: string;
  proof?: boolean;
  proofType?: string;
}

export function ApprovalWorkflow() {
  const { user, isAuthenticated } = useAuth();
  const { transactions, expenses, approveTransaction, rejectTransaction, approveExpense, rejectExpense } = useData();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  // Only supervisors and investors can access approvals
  if (user.role === "worker") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-500 text-white p-6 rounded-b-3xl shadow-lg">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl mb-1">Approvals</h1>
          <p className="text-white/90">अनुमोदन</p>
        </div>
        <div className="p-6 text-center mt-20">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-gray-700 mb-2">Access Restricted</p>
          <p className="text-gray-600">पहुंच प्रतिबंधित</p>
          <p className="text-sm text-gray-500 mt-4">
            Only supervisors and investors can approve items.
          </p>
        </div>
      </div>
    );
  }

  // Get all pending items
  const pendingItems = useMemo(() => {
    const pendingTransactions = transactions
      .filter((t) => t.status === "pending")
      .map((t) => ({
        id: t.id,
        type: "transaction" as const,
        submittedBy: t.submittedBy,
        amount: t.amount,
        description: t.description,
        category: undefined,
        truckNumber: t.truckNumber,
        weight: t.weight,
        date: t.date,
        time: t.time,
        proof: !!t.proofType,
        proofType: t.proofType,
      }));

    const pendingExpenses = expenses
      .filter((e) => e.status === "pending")
      .map((e) => ({
        id: e.id,
        type: "expense" as const,
        submittedBy: e.submittedBy,
        amount: e.amount,
        description: e.description,
        category: e.category,
        truckNumber: undefined,
        weight: undefined,
        date: e.date,
        time: e.time,
        proof: !!e.billPhoto,
        proofType: e.billPhoto,
      }));

    return [...pendingTransactions, ...pendingExpenses].sort(
      (a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
    );
  }, [transactions, expenses]);

  const handleApprove = (item: typeof pendingItems[0]) => {
    if (item.type === "transaction") {
      approveTransaction(item.id);
    } else {
      approveExpense(item.id);
    }
  };

  const handleReject = (item: typeof pendingItems[0]) => {
    if (item.type === "transaction") {
      rejectTransaction(item.id);
    } else {
      rejectExpense(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-500 text-white p-6 rounded-b-3xl shadow-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 p-2 bg-white/20 rounded-lg active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl mb-1">Approvals</h1>
        <p className="text-white/90">अनुमोदन</p>
      </div>

      {/* Summary */}
      <div className="p-6">
        <div className="bg-white rounded-2xl p-4 shadow mb-6">
          <div className="text-sm text-gray-600 mb-1">Pending Approvals</div>
          <div className="text-3xl">{pendingItems.length}</div>
          <div className="text-xs text-gray-500">लंबित अनुमोदन</div>
        </div>

        {/* Pending Items */}
        <div className="space-y-3">
          {pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl text-gray-700 mb-2">All Caught Up!</p>
              <p className="text-gray-600">सब स्वीकृत है</p>
              <p className="text-sm text-gray-500 mt-4">
                No pending approvals at this time.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-yellow-200"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      item.type === "transaction"
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    {item.type === "transaction" ? "💰" : "📝"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Submitted by {item.submittedBy}
                        </div>
                        <div className="font-medium">{item.description}</div>
                        {item.category && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                            {item.category}
                          </span>
                        )}
                        {item.truckNumber && (
                          <div className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                            <Truck className="w-3 h-3" />
                            <span>{item.truckNumber}</span>
                            {item.weight && (
                              <>
                                <span>•</span>
                                <span>{item.weight} kg</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xl font-medium">
                        ₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {item.time}
                      </span>
                      {item.proof && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <FileImage className="w-3 h-3" />
                            <span>
                              {item.proofType === "photo" && "Photo"}
                              {item.proofType === "video" && "Video"}
                              {item.proofType === "weighbridge" && "Weighbridge"}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(item)}
                    className="h-12 border-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Reject / अस्वीकार
                  </Button>
                  <Button
                    onClick={() => handleApprove(item)}
                    className="h-12 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Approve / स्वीकार
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}