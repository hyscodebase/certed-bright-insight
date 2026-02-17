import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { REPORT_FIELD_CATEGORIES } from "@/constants/reportFields";

interface CategorizedFieldCheckboxesProps {
  selectedFields: Set<string>;
  onToggle: (fieldKey: string) => void;
  onBulkToggle?: (fieldKeys: string[], selected: boolean) => void;
}

export function CategorizedFieldCheckboxes({ selectedFields, onToggle, onBulkToggle }: CategorizedFieldCheckboxesProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleOpen = (category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="space-y-1 rounded-lg border p-2">
      {REPORT_FIELD_CATEGORIES.map((cat) => {
        const selectedCount = cat.fields.filter(f => selectedFields.has(f.key)).length;
        const allSelected = selectedCount === cat.fields.length;
        const someSelected = selectedCount > 0;

        return (
          <Collapsible
            key={cat.category}
            open={openCategories.has(cat.category)}
            onOpenChange={() => toggleOpen(cat.category)}
          >
            <div className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted/50">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={() => {
                  const keys = cat.fields.map(f => f.key);
                  if (onBulkToggle) {
                    onBulkToggle(keys, !allSelected);
                  } else {
                    if (allSelected) {
                      cat.fields.forEach(f => { if (selectedFields.has(f.key)) onToggle(f.key); });
                    } else {
                      cat.fields.forEach(f => { if (!selectedFields.has(f.key)) onToggle(f.key); });
                    }
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex flex-1 cursor-pointer items-center gap-2"
                >
                  <span className="text-sm font-semibold text-foreground">{cat.category}</span>
                  <span className="text-xs text-muted-foreground">{selectedCount}/{cat.fields.length}</span>
                  <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${openCategories.has(cat.category) ? "rotate-180" : ""}`} />
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="ml-6 space-y-0.5 pb-1">
                {cat.fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-muted/50"
                    onClick={() => onToggle(field.key)}
                  >
                    <Checkbox
                      checked={selectedFields.has(field.key)}
                      onCheckedChange={() => onToggle(field.key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm">{field.label}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
