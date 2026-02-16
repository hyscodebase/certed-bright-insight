import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ListItem {
  category: string;
  content: string;
}

interface ListFieldInputProps {
  label: string;
  required?: boolean;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  categories: string[];
  contentPlaceholder?: string;
  isInvalid?: boolean;
}

export function ListFieldInput({
  label,
  required,
  items,
  onChange,
  categories,
  contentPlaceholder = "내용을 입력하세요",
  isInvalid,
}: ListFieldInputProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [contentValue, setContentValue] = useState("");

  const handleAdd = () => {
    if (!selectedCategory || !contentValue.trim()) return;
    onChange([...items, { category: selectedCategory, content: contentValue.trim() }]);
    setSelectedCategory("");
    setContentValue("");
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  // Group items by category for display
  const groupedItems = items.reduce<Record<string, { item: ListItem; index: number }[]>>(
    (acc, item, index) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({ item, index });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-3">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {/* Add new item */}
      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={contentValue}
          onChange={(e) => setContentValue(e.target.value)}
          placeholder={contentPlaceholder}
          className="min-h-[60px]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!selectedCategory || !contentValue.trim()}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </Button>
      </div>

      {/* Display grouped items */}
      {Object.keys(groupedItems).length > 0 && (
        <div className="space-y-3">
          {Object.entries(groupedItems).map(([category, entries]) => (
            <div key={category} className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">{category}</span>
              {entries.map(({ item, index }) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="flex-1 whitespace-pre-wrap">{item.content}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {isInvalid && items.length === 0 && (
        <p className="text-xs text-destructive">최소 1개 항목을 추가해주세요</p>
      )}
    </div>
  );
}
