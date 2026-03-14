import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  ArrowLeft,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Calendar,
  Truck,
  Camera,
  Video,
  Scale,
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

interface Transaction {
  id: string;
  type: "in" | "out";
  amount: number;
  description: string;
  truckNumber?: string;
  numberOfSacks?: number;
  weight?: number;
  pricePerQuintal?: number;
  proofType?: "photo" | "video" | "weighbridge";
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedById: string;
}

export function TransactionLog() {
  const { user, isAuthenticated } = useAuth();
  const { transactions, addTransaction } = useData();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "in" as "in" | "out",
    description: "",
    truckNumber: "",
    numberOfSacks: "",
    weight: "",
    pricePerQuintal: "",
  });
  const [capturedProof, setCapturedProof] = useState<
    "photo" | "video" | "weighbridge" | null
  >(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Auto-calculate total amount
  useEffect(() => {
    const weight = parseFloat(formData.weight) || 0;
    const pricePerQuintal = parseFloat(formData.pricePerQuintal) || 0;
    const quintals = weight / 100; // Convert kg to quintals
    const total = quintals * pricePerQuintal;
    setTotalAmount(total);
  }, [formData.weight, formData.pricePerQuintal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTransaction({
      type: formData.type,
      amount: totalAmount,
      description: formData.description,
      truckNumber: formData.truckNumber,
      numberOfSacks: parseInt(formData.numberOfSacks),
      weight: parseFloat(formData.weight),
      pricePerQuintal: parseFloat(formData.pricePerQuintal),
      proofType: capturedProof || undefined,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: user.role === "worker" ? "pending" : "approved",
      submittedBy: user.name,
      submittedById: user.id,
    });

    // Reset form
    setFormData({
      type: "in",
      description: "",
      truckNumber: "",
      numberOfSacks: "",
      weight: "",
      pricePerQuintal: "",
    });
    setCapturedProof(null);
    setIsOpen(false);
  };

  const handleCaptureProof = (type: "photo" | "video" | "weighbridge") => {
    // In a real app, this would open camera/video capture
    // For now, just simulate capture
    setCapturedProof(type);
  };

  // Filter transactions based on role
  const visibleTransactions =
    user.role === "worker"
      ? transactions.filter((t) => t.submittedById === user.id)
      : transactions;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
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
                    New Transaction / नया लेनदेन
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">Type / प्रकार</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: "in" })
                        }
                        className={`p-4 rounded-xl border-2 ${
                          formData.type === "in"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <ArrowDownCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-sm">Money IN</div>
                        <div className="text-xs text-gray-600">आने वाला</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: "out" })
                        }
                        className={`p-4 rounded-xl border-2 ${
                          formData.type === "out"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <ArrowUpCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <div className="text-sm">Money OUT</div>
                        <div className="text-xs text-gray-600">जाने वाला</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="truckNumber" className="text-base">
                      Truck Number / ट्रक नंबर
                    </Label>
                    <div className="relative mt-2">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="truckNumber"
                        placeholder="MH12AB1234"
                        value={formData.truckNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            truckNumber: e.target.value.toUpperCase(),
                          })
                        }
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sacks" className="text-base">
                        Sacks / बोरे
                      </Label>
                      <Input
                        id="sacks"
                        type="number"
                        placeholder="100"
                        value={formData.numberOfSacks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfSacks: e.target.value,
                          })
                        }
                        className="h-12 mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-base">
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        placeholder="5000"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        className="h-12 mt-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-base">
                      Price per Quintal (₹) / कीमत प्रति क्विंटल
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="1000"
                      value={formData.pricePerQuintal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerQuintal: e.target.value,
                        })
                      }
                      className="h-12 mt-2"
                      required
                    />
                  </div>

                  {/* Total Amount Display */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="text-sm text-orange-700 mb-1">
                      Total Amount / कुल राशि
                    </div>
                    <div className="text-3xl text-orange-600">
                      ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {(parseFloat(formData.weight) / 100 || 0).toFixed(2)}{" "}
                      quintals × ₹{formData.pricePerQuintal || 0}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base">
                      Description / विवरण
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Details about this transaction"
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
                      Proof / प्रमाण (Required)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleCaptureProof("photo")}
                        className={`p-4 rounded-xl border-2 ${
                          capturedProof === "photo"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Camera className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-xs">Photo</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCaptureProof("video")}
                        className={`p-4 rounded-xl border-2 ${
                          capturedProof === "video"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Video className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-xs">Video</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCaptureProof("weighbridge")}
                        className={`p-4 rounded-xl border-2 ${
                          capturedProof === "weighbridge"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Scale className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-xs">Weigh</div>
                      </button>
                    </div>
                    {!capturedProof && (
                      <p className="text-xs text-red-600 mt-2">
                        * Proof is required for all transactions
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={!capturedProof}
                  >
                    Add Transaction / जोड़ें
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <h1 className="text-2xl mb-1">Transactions</h1>
        <p className="text-white/90">लेनदेन</p>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search / खोजें"
            className="pl-12 h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6 space-y-3">
        {visibleTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500">कोई लेनदेन नहीं</p>
          </div>
        ) : (
          visibleTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === "in" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {transaction.type === "in" ? (
                    <ArrowDownCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowUpCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-medium">
                        {transaction.description}
                      </div>
                      {transaction.truckNumber && (
                        <div className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                          <Truck className="w-3 h-3" />
                          <span>{transaction.truckNumber}</span>
                          <span>•</span>
                          <span>{transaction.numberOfSacks} sacks</span>
                          <span>•</span>
                          <span>{transaction.weight} kg</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          • {transaction.time}
                        </span>
                        {transaction.proofType && (
                          <>
                            <span>•</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {transaction.proofType === "photo" && "📷"}
                              {transaction.proofType === "video" && "🎥"}
                              {transaction.proofType === "weighbridge" && "⚖️"}
                            </span>
                          </>
                        )}
                      </div>
                      {user.role !== "worker" && (
                        <div className="text-xs text-gray-500 mt-1">
                          by {transaction.submittedBy}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-lg ${
                        transaction.type === "in"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "in" ? "+" : "-"}₹
                      {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  {transaction.status === "pending" && (
                    <div className="mt-2">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        ⏳ Pending Approval
                      </span>
                    </div>
                  )}
                  {transaction.status === "rejected" && (
                    <div className="mt-2">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        ❌ Rejected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}