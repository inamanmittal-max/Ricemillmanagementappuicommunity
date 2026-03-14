import { useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { ArrowLeft, Clock, Filter, User, FileText, Receipt, StickyNote, Package } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

export function AuditLog() {
  const { user, isAuthenticated } = useAuth();
  const { auditLogs } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  // Only investors and supervisors can access audit logs
  if (user.role === "worker") {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || log.entityType === filterType;
      const matchesAction = filterAction === "all" || log.action === filterAction;

      return matchesSearch && matchesType && matchesAction;
    });
  }, [auditLogs, searchQuery, filterType, filterAction]);

  const actionColors = {
    create: "bg-green-100 text-green-700",
    update: "bg-blue-100 text-blue-700",
    delete: "bg-red-100 text-red-700",
    approve: "bg-emerald-100 text-emerald-700",
    reject: "bg-orange-100 text-orange-700",
  };

  const entityIcons = {
    transaction: FileText,
    expense: Receipt,
    note: StickyNote,
    inventory: Package,
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-slate-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-2xl mb-1">Audit Log</h1>
        <p className="text-white/90">ऑडिट लॉग / रिकॉर्ड</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by user, action, or type / खोजें"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="all">All Types</option>
            <option value="transaction">Transactions</option>
            <option value="expense">Expenses</option>
            <option value="note">Notes</option>
            <option value="inventory">Inventory</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-xl mb-1">{auditLogs.length}</div>
            <div className="text-xs text-gray-600">Total Logs</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl mb-1">
              {new Set(auditLogs.map((l) => l.userId)).size}
            </div>
            <div className="text-xs text-gray-600">Users</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl mb-1">
              {auditLogs.filter((l) => {
                const date = new Date(l.timestamp);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </Card>
        </div>

        {/* Audit Log List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">No audit logs found</p>
            <p className="text-sm text-gray-500">कोई लॉग नहीं मिला</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const EntityIcon = entityIcons[log.entityType as keyof typeof entityIcons] || FileText;
              
              return (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <EntityIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${actionColors[log.action as keyof typeof actionColors]}`}>
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.entityType}
                        </span>
                      </div>
                      <div className="text-sm mb-1">
                        <span className="font-medium">{log.userName}</span>
                        <span className="text-gray-600">
                          {" "}{log.action}d a {log.entityType}
                        </span>
                      </div>
                      
                      {/* Changes */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                          <div className="font-medium text-gray-700">Changes:</div>
                          {Object.entries(log.changes).map(([key, change]) => (
                            <div key={key} className="flex items-baseline space-x-2">
                              <span className="text-gray-600">{key}:</span>
                              <span className="text-red-600 line-through">
                                {typeof change.old === "object" ? JSON.stringify(change.old) : String(change.old)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600">
                                {typeof change.new === "object" ? JSON.stringify(change.new) : String(change.new)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
