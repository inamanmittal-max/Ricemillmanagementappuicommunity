import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { ArrowLeft, Package, TrendingUp, TrendingDown, RefreshCw, Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

export function Inventory() {
  const { user, isAuthenticated } = useAuth();
  const { inventory, updateInventory, transactions } = useData();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    rawRiceStock: inventory.rawRiceStock.toString(),
    processedRiceStock: inventory.processedRiceStock.toString(),
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  // Calculate today's changes
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter(
    (t) => t.date === today && t.status === "approved"
  );

  const todayRawIn = todayTransactions
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + (t.weight || 0), 0);

  const todayProcessedOut = todayTransactions
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + (t.weight || 0), 0);

  const handleUpdateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateInventory({
      rawRiceStock: parseFloat(editForm.rawRiceStock),
      processedRiceStock: parseFloat(editForm.processedRiceStock),
    });
    
    setIsEditOpen(false);
  };

  // Only supervisors and investors can edit inventory
  const canEdit = user.role === "supervisor" || user.role === "investor";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {canEdit && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <button className="p-2 bg-white/20 rounded-lg active:scale-95">
                  <Edit2 className="w-6 h-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Update Inventory / इन्वेंटरी अपडेट करें
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateInventory} className="space-y-4">
                  <div>
                    <Label htmlFor="rawRice" className="text-base">
                      Raw Rice Stock (kg) / कच्चे चावल का स्टॉक
                    </Label>
                    <Input
                      id="rawRice"
                      type="number"
                      step="0.01"
                      value={editForm.rawRiceStock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, rawRiceStock: e.target.value })
                      }
                      className="h-12 mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="processedRice" className="text-base">
                      Processed Rice Stock (kg) / प्रोसेस्ड चावल का स्टॉक
                    </Label>
                    <Input
                      id="processedRice"
                      type="number"
                      step="0.01"
                      value={editForm.processedRiceStock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, processedRiceStock: e.target.value })
                      }
                      className="h-12 mt-2"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base">
                    Update / अपडेट करें
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <h1 className="text-2xl mb-1">Inventory</h1>
        <p className="text-white/90">इन्वेंटरी / स्टॉक</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Last Updated */}
        <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
          <RefreshCw className="w-4 h-4" />
          <span>
            Last updated: {new Date(inventory.lastUpdated).toLocaleString("en-US")}
          </span>
        </div>

        {/* Stock Cards */}
        <div className="space-y-4">
          {/* Raw Rice Stock */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Raw / कच्चा
              </div>
            </div>
            <div className="mb-2">
              <div className="text-4xl mb-1">
                {(inventory.rawRiceStock / 1000).toFixed(2)}
                <span className="text-2xl text-amber-700 ml-2">tons</span>
              </div>
              <div className="text-lg text-amber-700">
                {inventory.rawRiceStock.toLocaleString("en-IN")} kg
              </div>
            </div>
            <div className="text-sm text-amber-700">Raw Rice Stock</div>
            <div className="text-xs text-amber-600">कच्चे चावल का स्टॉक</div>
            
            {todayRawIn > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200 flex items-center space-x-2 text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+{todayRawIn} kg added today</span>
              </div>
            )}
          </Card>

          {/* Processed Rice Stock */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Processed / तैयार
              </div>
            </div>
            <div className="mb-2">
              <div className="text-4xl mb-1">
                {(inventory.processedRiceStock / 1000).toFixed(2)}
                <span className="text-2xl text-emerald-700 ml-2">tons</span>
              </div>
              <div className="text-lg text-emerald-700">
                {inventory.processedRiceStock.toLocaleString("en-IN")} kg
              </div>
            </div>
            <div className="text-sm text-emerald-700">Processed Rice Stock</div>
            <div className="text-xs text-emerald-600">प्रोसेस्ड चावल का स्टॉक</div>
            
            {todayProcessedOut > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200 flex items-center space-x-2 text-red-700">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">-{todayProcessedOut} kg sold today</span>
              </div>
            )}
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="text-sm text-blue-900 mb-2">
            ℹ️ Automatic Updates / स्वचालित अपडेट
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Raw rice stock increases when you purchase rice (Money OUT transactions)</p>
            <p>• Processed rice stock decreases when you sell rice (Money IN transactions)</p>
            <p>• Only approved transactions affect inventory</p>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">
              {((inventory.rawRiceStock + inventory.processedRiceStock) / 1000).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Stock (tons)</div>
            <div className="text-xs text-gray-500">कुल स्टॉक</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">
              {((inventory.processedRiceStock / (inventory.rawRiceStock + inventory.processedRiceStock)) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Processed</div>
            <div className="text-xs text-gray-500">प्रोसेस्ड</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
