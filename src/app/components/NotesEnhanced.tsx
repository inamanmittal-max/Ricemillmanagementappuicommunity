import { useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  ArrowLeft,
  Plus,
  Pin,
  MessageCircle,
  Search,
  Filter,
  X,
  Send,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

// Mock users for @mentions
const MOCK_USERS = [
  { id: "1", username: "worker1", name: "Ram Kumar" },
  { id: "2", username: "worker2", name: "Suresh Yadav" },
  { id: "3", username: "supervisor1", name: "Amit Singh" },
  { id: "4", username: "investor1", name: "Rajesh Mehta" },
];

export function NotesEnhanced() {
  const { user, isAuthenticated } = useAuth();
  const { notes, addNote, updateNote, deleteNote, pinNote, unpinNote } = useData();
  const navigate = useNavigate();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    content: "",
    category: "general" as "general" | "urgent" | "maintenance" | "finance" | "inventory",
    status: "open" as "open" | "in-progress" | "resolved",
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  // Extract @mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const mentionedUser = MOCK_USERS.find((u) => u.username === username);
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    return mentions;
  };

  // Highlight @mentions in text
  const highlightMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span key={idx} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();

    const mentions = extractMentions(formData.content);

    if (replyingTo) {
      // Add as reply
      addNote({
        content: formData.content,
        category: formData.category,
        status: formData.status,
        isPinned: false,
        createdBy: user.name,
        createdById: user.id,
        mentions,
        parentId: replyingTo,
      });
      setReplyingTo(null);
    } else {
      // Add as new note
      addNote({
        content: formData.content,
        category: formData.category,
        status: formData.status,
        isPinned: false,
        createdBy: user.name,
        createdById: user.id,
        mentions,
      });
    }

    setFormData({
      content: "",
      category: "general",
      status: "open",
    });
    setIsAddOpen(false);
  };

  // Organize notes into threads
  const organizedNotes = useMemo(() => {
    const topLevel = notes.filter((n) => !n.parentId);
    const withReplies = topLevel.map((note) => ({
      ...note,
      replies: notes.filter((n) => n.parentId === note.id),
    }));
    return withReplies;
  }, [notes]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return organizedNotes.filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || note.category === filterCategory;

      const matchesStatus = filterStatus === "all" || note.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [organizedNotes, searchQuery, filterCategory, filterStatus]);

  // Sort: pinned first, then by date
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredNotes]);

  const categoryColors = {
    general: "bg-gray-100 text-gray-700",
    urgent: "bg-red-100 text-red-700",
    maintenance: "bg-orange-100 text-orange-700",
    finance: "bg-green-100 text-green-700",
    inventory: "bg-blue-100 text-blue-700",
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
  };

  const categoryLabels = {
    general: { en: "General", hi: "सामान्य" },
    urgent: { en: "Urgent", hi: "जरूरी" },
    maintenance: { en: "Maintenance", hi: "रखरखाव" },
    finance: { en: "Finance", hi: "वित्त" },
    inventory: { en: "Inventory", hi: "स्टॉक" },
  };

  const statusLabels = {
    open: { en: "Open", hi: "खुला" },
    "in-progress": { en: "In Progress", hi: "प्रगति में" },
    resolved: { en: "Resolved", hi: "हल हो गया" },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-purple-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white/20 rounded-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="p-2 bg-white/20 rounded-lg active:scale-95">
                <Plus className="w-6 h-6" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {replyingTo ? "Reply to Note / जवाब दें" : "New Note / नया नोट"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitNote} className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-base">
                    Content / सामग्री
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Type your note here... Use @username to mention someone"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="mt-2 min-h-32"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Tip: Use @worker1, @supervisor1, or @investor1 to tag users
                  </p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-base">
                    Category / श्रेणी
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as typeof formData.category,
                      })
                    }
                    className="w-full h-12 mt-2 rounded-md border border-gray-300 px-3"
                  >
                    <option value="general">General / सामान्य</option>
                    <option value="urgent">Urgent / जरूरी</option>
                    <option value="maintenance">Maintenance / रखरखाव</option>
                    <option value="finance">Finance / वित्त</option>
                    <option value="inventory">Inventory / स्टॉक</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-base">
                    Status / स्थिति
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as typeof formData.status,
                      })
                    }
                    className="w-full h-12 mt-2 rounded-md border border-gray-300 px-3"
                  >
                    <option value="open">Open / खुला</option>
                    <option value="in-progress">In Progress / प्रगति में</option>
                    <option value="resolved">Resolved / हल हो गया</option>
                  </select>
                </div>

                <Button type="submit" className="w-full h-12 text-base">
                  <Send className="w-5 h-5 mr-2" />
                  {replyingTo ? "Reply / जवाब दें" : "Add Note / जोड़ें"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <h1 className="text-2xl mb-1">Notes</h1>
        <p className="text-white/90">नोट्स / टिप्पणियाँ</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search notes / खोजें"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="maintenance">Maintenance</option>
            <option value="finance">Finance</option>
            <option value="inventory">Inventory</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Notes List */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600">No notes found</p>
            <p className="text-sm text-gray-500">कोई नोट नहीं मिला</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <Card key={note.id} className="p-4">
                {/* Note Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1">
                    {note.isPinned && <Pin className="w-4 h-4 text-purple-600" />}
                    <Badge className={categoryColors[note.category]}>
                      {categoryLabels[note.category].en}
                    </Badge>
                    <Badge className={statusColors[note.status]}>
                      {statusLabels[note.status].en}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {(user.role === "supervisor" || user.role === "investor") && (
                      <button
                        onClick={() =>
                          note.isPinned ? unpinNote(note.id) : pinNote(note.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Pin
                          className={`w-4 h-4 ${
                            note.isPinned ? "text-purple-600 fill-purple-600" : "text-gray-400"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Note Content */}
                <div className="mb-2">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {highlightMentions(note.content)}
                  </p>
                </div>

                {/* Note Meta */}
                <div className="text-xs text-gray-500 mb-2">
                  By {note.createdBy} •{" "}
                  {new Date(note.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* Replies */}
                {note.replies && note.replies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    {note.replies.map((reply) => (
                      <div key={reply.id} className="ml-4 pl-4 border-l-2 border-purple-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {highlightMentions(reply.content)}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {reply.createdBy} •{" "}
                          {new Date(reply.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Button */}
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setReplyingTo(note.id);
                      setIsAddOpen(true);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Reply / जवाब दें</span>
                  </button>
                </div>

                {/* Update Status - for supervisors and investors */}
                {(user.role === "supervisor" || user.role === "investor") &&
                  note.status !== "resolved" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Update Status:</span>
                        <button
                          onClick={() =>
                            updateNote(note.id, { status: "in-progress" })
                          }
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateNote(note.id, { status: "resolved" })}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
