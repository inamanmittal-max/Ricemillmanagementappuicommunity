import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Plus, Search, Tag, Calendar } from "lucide-react";
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

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  date: string;
  time: string;
}

export function Notes() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Machine Maintenance",
      content: "Oil change and filter replacement scheduled for next Monday",
      tags: ["maintenance", "urgent"],
      author: "Amit Singh",
      date: "2026-03-12",
      time: "05:30 PM",
    },
    {
      id: "2",
      title: "New Client Order",
      content: "500 kg rice order from Krishna Traders - delivery by 20th March",
      tags: ["orders", "important"],
      author: "Ram Kumar",
      date: "2026-03-11",
      time: "02:15 PM",
    },
    {
      id: "3",
      title: "Stock Status",
      content: "Current stock: 2500 kg raw rice, 1800 kg processed rice",
      tags: ["inventory"],
      author: "Amit Singh",
      date: "2026-03-10",
      time: "11:00 AM",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const availableTags = [
    { id: "maintenance", name: "Maintenance", color: "bg-orange-100 text-orange-700" },
    { id: "orders", name: "Orders", color: "bg-blue-100 text-blue-700" },
    { id: "inventory", name: "Inventory", color: "bg-green-100 text-green-700" },
    { id: "urgent", name: "Urgent", color: "bg-red-100 text-red-700" },
    { id: "important", name: "Important", color: "bg-purple-100 text-purple-700" },
    { id: "payment", name: "Payment", color: "bg-yellow-100 text-yellow-700" },
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Note = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      tags: selectedTags,
      author: user.name,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setNotes([newNote, ...notes]);

    // Add to activity timeline
    const activity = {
      type: "note",
      action: "Created note",
      description: formData.title,
      user: user.name,
      timestamp: new Date().toISOString(),
    };
    const activities = JSON.parse(localStorage.getItem("activities") || "[]");
    activities.unshift(activity);
    localStorage.setItem("activities", JSON.stringify(activities));

    setFormData({ title: "", content: "", tags: "" });
    setSelectedTags([]);
    setIsOpen(false);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const getTagColor = (tagId: string) => {
    const tag = availableTags.find((t) => t.id === tagId);
    return tag?.color || "bg-gray-100 text-gray-700";
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="p-2 bg-white/20 rounded-lg active:scale-95">
                <Plus className="w-6 h-6" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  New Note / नया नोट
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base">
                    Title / शीर्षक
                  </Label>
                  <Input
                    id="title"
                    placeholder="Note title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="h-12 mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-base">
                    Content / सामग्री
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Write your note here..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="mt-2 min-h-32"
                    required
                  />
                </div>
                <div>
                  <Label className="text-base mb-3 block">
                    Tags / टैग
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-2 rounded-lg text-sm border-2 transition-all ${
                          selectedTags.includes(tag.id)
                            ? `${tag.color} border-current`
                            : "bg-white border-gray-200 text-gray-600"
                        }`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base">
                  Add Note / जोड़ें
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <h1 className="text-2xl mb-1">Notes</h1>
        <p className="text-white/90">नोट्स</p>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search notes / नोट्स खोजें"
            className="pl-12 h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tags */}
      <div className="px-6 mb-6">
        <div className="flex overflow-x-auto space-x-2 pb-2 -mx-6 px-6">
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm whitespace-nowrap flex-shrink-0">
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              className={`px-4 py-2 ${tag.color} rounded-lg text-sm whitespace-nowrap flex-shrink-0`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="px-6 space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-lg flex-1">{note.title}</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {note.content}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.map((tagId) => (
                <span
                  key={tagId}
                  className={`text-xs px-2 py-1 rounded ${getTagColor(tagId)}`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {availableTags.find((t) => t.id === tagId)?.name || tagId}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span>by {note.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(note.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  • {note.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}