"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Tags,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  ShoppingBag,
  Home,
  Zap,
  Utensils,
  Car,
  HeartPulse,
  Film,
  BookOpen,
  Briefcase,
  Laptop,
  TrendingUp,
  FolderTree,
} from "lucide-react";
import { CategoryDto } from "@/services/category.service";

const ICON_MAP: Record<string, typeof Tags> = {
  ShoppingCart: ShoppingBag,
  ShoppingBag: ShoppingBag,
  Home: Home,
  Zap: Zap,
  Utensils: Utensils,
  Car: Car,
  HeartPulse: HeartPulse,
  Film: Film,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  Laptop: Laptop,
  TrendingUp: TrendingUp,
  PlusCircle: Plus,
  Tags: Tags,
};

const COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#64748b", // Slate
];

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [activeTab, setActiveTab] = React.useState<"expense" | "income">("expense");
  const [isLoading, setIsLoading] = React.useState(true);
  const [showArchived, setShowArchived] = React.useState(false);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryDto | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"expense" | "income">("expense");
  const [parentId, setParentId] = React.useState<string>("");
  const [colorToken, setColorToken] = React.useState("#6366f1");
  const [icon, setIcon] = React.useState("Tags");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchCategories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/categories?includeArchived=${showArchived}`);
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setName("");
    setType(activeTab);
    setParentId("");
    setColorToken(activeTab === "expense" ? "#f43f5e" : "#10b981");
    setIcon("Tags");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: CategoryDto) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setParentId(cat.parentId || "");
    setColorToken(cat.colorToken || "#6366f1");
    setIcon(cat.icon || "Tags");
    setIsEditOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          parentId: parentId || undefined,
          colorToken,
          icon,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create category");
        return;
      }

      toast.success("Category created successfully!");
      setIsAddOpen(false);
      fetchCategories();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          parentId: parentId ? parentId : null,
          colorToken,
          icon,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update category");
        return;
      }

      toast.success("Category updated successfully!");
      setIsEditOpen(false);
      fetchCategories();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (cat: CategoryDto) => {
    const newArchived = !cat.isArchived;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: newArchived }),
      });

      if (!res.ok) {
        toast.error("Failed to update archive status");
        return;
      }

      toast.success(newArchived ? "Category archived." : "Category restored.");
      fetchCategories();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const potentialParents = categories.filter(
    (c) => c.type === type && !c.parentId && (!editingCategory || c.id !== editingCategory.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category Taxonomy</h2>
          <p className="text-sm text-muted-foreground">
            Structure and customize income and expense classifications for budgeting and reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "expense"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expense Categories ({categories.filter((c) => c.type === "expense" && !c.isArchived).length})
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "income"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Income Categories ({categories.filter((c) => c.type === "income" && !c.isArchived).length})
        </button>
      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Tags className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No {activeTab} categories found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Add categories to classify your transactions and set category-based budgets.
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add {activeTab} Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const Icon = (cat.icon && ICON_MAP[cat.icon]) || Tags;
            const parent = categories.find((p) => p.id === cat.parentId);

            return (
              <Card
                key={cat.id}
                className={`shadow-sm hover:shadow-md transition-all ${
                  cat.isArchived ? "opacity-60 bg-muted/30" : "bg-card"
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: cat.colorToken || (cat.type === "income" ? "#10b981" : "#f43f5e") }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-1.5">
                        {cat.name}
                        {cat.isArchived && <Badge variant="outline" className="text-[10px]">Archived</Badge>}
                      </h4>
                      {parent ? (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <FolderTree className="w-3 h-3" />
                          <span>{parent.name}</span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Root Category
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleOpenEdit(cat)}
                      aria-label="Edit category"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleToggleArchive(cat)}
                      title={cat.isArchived ? "Restore" : "Archive"}
                      aria-label={cat.isArchived ? "Restore category" : "Archive category"}
                    >
                      {cat.isArchived ? (
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Category"
        description="Create a new classification for your transactions."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category Name</label>
            <Input
              placeholder="e.g. Groceries, Gym, SaaS, Dividends"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "destructive" : "outline"}
                size="sm"
                onClick={() => {
                  setType("expense");
                  setColorToken("#f43f5e");
                }}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "success" : "outline"}
                size="sm"
                onClick={() => {
                  setType("income");
                  setColorToken("#10b981");
                }}
              >
                Income
              </Button>
            </div>
          </div>

          {potentialParents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Parent Category (Optional)</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None (Top-level Category)</option>
                {potentialParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Color Preset</label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorToken(hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorToken === hex ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${hex}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
        description="Update naming or color branding."
      >
        <form onSubmit={handleUpdateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {potentialParents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Parent Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None (Top-level Category)</option>
                {potentialParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Color Preset</label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorToken(hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorToken === hex ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${hex}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
