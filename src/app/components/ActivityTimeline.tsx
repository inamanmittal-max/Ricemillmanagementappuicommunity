import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  Receipt,
  StickyNote,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Activity {
  id: string;
  type: "transaction" | "expense" | "approval" | "note" | "inventory";
  action: string;
  description: string;
  user: string;
  timestamp: string;
  amount?: number;
  status?: "approved" | "rejected";
}

export function ActivityTimeline() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Move all hooks to the top - before any conditional returns
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    activityType: "all",
    userName: "all",
    dateFilter: "all",
    month: "",
    year: "",
  });

  // Load activities from localStorage
  useEffect(() => {
    const storedActivities = localStorage.getItem("activities");
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
      setFilteredActivities(JSON.parse(storedActivities));
    } else {
      // Initialize with some mock activities
      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "approval",
          action: "Approved expense",
          description: "Diesel for generator",
          user: "Amit Singh",
          timestamp: "2026-03-13T11:45:00",
          amount: 2500,
          status: "approved",
        },
        {
          id: "2",
          type: "transaction",
          action: "Added incoming transaction",
          description: "Rice Sale - Truck Load",
          user: "Ram Kumar",
          timestamp: "2026-03-13T10:30:00",
          amount: 50000,
        },
        {
          id: "3",
          type: "expense",
          action: "Added expense",
          description: "Daily wages - 5 workers",
          user: "Suresh Yadav",
          timestamp: "2026-03-13T09:15:00",
          amount: 3000,
        },
        {
          id: "4",
          type: "note",
          action: "Created note",
          description: "Machine maintenance scheduled for next week",
          user: "Amit Singh",
          timestamp: "2026-03-12T17:30:00",
        },
        {
          id: "5",
          type: "approval",
          action: "Approved transaction",
          description: "Rice sale - 70 kg",
          user: "Amit Singh",
          timestamp: "2026-03-12T16:45:00",
          amount: 3500,
          status: "approved",
        },
        {
          id: "6",
          type: "inventory",
          action: "Updated inventory",
          description: "Added new stock - 2000 kg raw rice",
          user: "Ram Kumar",
          timestamp: "2026-03-12T14:20:00",
        },
      ];
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      localStorage.setItem("activities", JSON.stringify(mockActivities));
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...activities];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Activity type filter
    if (filters.activityType !== "all") {
      filtered = filtered.filter((a) => a.type === filters.activityType);
    }

    // User filter
    if (filters.userName !== "all") {
      filtered = filtered.filter((a) => a.user === filters.userName);
    }

    // Date filters
    if (filters.dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter((a) => a.timestamp.startsWith(today));
    } else if (filters.dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (a) => new Date(a.timestamp) >= weekAgo
      );
    } else if (filters.dateFilter === "month" && filters.month) {
      filtered = filtered.filter((a) =>
        a.timestamp.startsWith(`${filters.year || new Date().getFullYear()}-${filters.month}`)
      );
    } else if (filters.dateFilter === "year" && filters.year) {
      filtered = filtered.filter((a) =>
        a.timestamp.startsWith(filters.year)
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchQuery, filters]);

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case "transaction":
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
        );
      case "expense":
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-red-600" />
          </div>
        );
      case "approval":
        return (
          <div
            className={`w-10 h-10 ${
              activity.status === "approved" ? "bg-green-100" : "bg-red-100"
            } rounded-full flex items-center justify-center`}
          >
            {activity.status === "approved" ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
          </div>
        );
      case "note":
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-purple-600" />
          </div>
        );
      case "inventory":
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📦</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const groupActivitiesByDate = (activities: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {};
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  const uniqueUsers = Array.from(new Set(activities.map((a) => a.user)));

  const resetFilters = () => {
    setFilters({
      activityType: "all",
      userName: "all",
      dateFilter: "all",
      month: "",
      year: "",
    });
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== "all"
  ).length;

  // Check authentication and user AFTER all hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-2 bg-white/20 rounded-lg active:scale-95 relative">
                <Filter className="w-6 h-6" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Timeline / फ़िल्टर करें</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-2 block">Activity Type</Label>
                  <Select
                    value={filters.activityType}
                    onValueChange={(value) =>
                      setFilters({ ...filters, activityType: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="transaction">Transactions</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                      <SelectItem value="approval">Approvals</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base mb-2 block">User</Label>
                  <Select
                    value={filters.userName}
                    onValueChange={(value) =>
                      setFilters({ ...filters, userName: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((userName) => (
                        <SelectItem key={userName} value={userName}>
                          {userName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base mb-2 block">Date Range</Label>
                  <Select
                    value={filters.dateFilter}
                    onValueChange={(value) =>
                      setFilters({ ...filters, dateFilter: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Specific Month</SelectItem>
                      <SelectItem value="year">Specific Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.dateFilter === "month" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Month</Label>
                      <Input
                        type="number"
                        placeholder="MM"
                        min="1"
                        max="12"
                        value={filters.month}
                        onChange={(e) =>
                          setFilters({ ...filters, month: e.target.value })
                        }
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Year</Label>
                      <Input
                        type="number"
                        placeholder="YYYY"
                        value={filters.year}
                        onChange={(e) =>
                          setFilters({ ...filters, year: e.target.value })
                        }
                        className="h-12 mt-1"
                      />
                    </div>
                  </div>
                )}

                {filters.dateFilter === "year" && (
                  <div>
                    <Label className="text-sm">Year</Label>
                    <Input
                      type="number"
                      placeholder="YYYY"
                      value={filters.year}
                      onChange={(e) =>
                        setFilters({ ...filters, year: e.target.value })
                      }
                      className="h-12 mt-1"
                    />
                  </div>
                )}

                <button
                  onClick={resetFilters}
                  className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-600 active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <h1 className="text-2xl mb-1">Activity Timeline</h1>
        <p className="text-white/90">गतिविधि समयरेखा</p>
      </div>

      {/* Search */}
      <div className="p-6">
        <Input
          placeholder="Search activities / खोजें"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>

      {/* Timeline */}
      <div className="px-6">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600">No activities found</p>
            <p className="text-sm text-gray-500">कोई गतिविधि नहीं मिली</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="mb-6">
              <div className="text-sm font-medium text-gray-600 mb-4 sticky top-0 bg-gray-50 py-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="space-y-4">
                {dateActivities.map((activity, index) => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      {getActivityIcon(activity)}
                      {index < dateActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="font-medium text-sm">
                            {activity.action}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <User className="w-3 h-3" />
                            <span>{activity.user}</span>
                          </div>
                        </div>
                        {activity.amount && (
                          <div className="text-base font-medium">
                            ₹{activity.amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}