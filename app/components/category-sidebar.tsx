"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Coffee, Cookie, LayoutGrid, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface CategorySidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const getIconComponent = (iconName: string): React.ElementType => {
  switch (iconName) {
    case "UtensilsCrossed":
      return UtensilsCrossed;
    case "Coffee":
      return Coffee;
    case "Cookie":
      return Cookie;
    default:
      return LayoutGrid;
  }
};

export default function CategorySidebar({
  isOpen,
  onOpenChange,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="w-full">
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="flex flex-row overflow-x-auto items-center gap-3 p-4 border-b hide-scrollbar">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="flex-shrink-0"
            onClick={() => onSelectCategory("all")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Semua Produk</span>
          </Button>

          {categories.map((category) => {
            const Icon = getIconComponent(category.icon || "LayoutGrid");
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                className="flex-shrink-0"
                onClick={() => onSelectCategory(category.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="text-sm">{category.name}</span>
              </Button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
