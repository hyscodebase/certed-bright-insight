import { Checkbox } from "@/components/ui/checkbox";
import { REPORT_FIELD_CATEGORIES } from "@/constants/reportFields";

interface CategorizedFieldCheckboxesProps {
  selectedFields: Set<string>;
  onToggle: (fieldKey: string) => void;
}

export function CategorizedFieldCheckboxes({ selectedFields, onToggle }: CategorizedFieldCheckboxesProps) {
  return (
    <div className="space-y-4 rounded-lg border p-3">
      {REPORT_FIELD_CATEGORIES.map((cat) => {
        const allSelected = cat.fields.every(f => selectedFields.has(f.key));
        const someSelected = cat.fields.some(f => selectedFields.has(f.key));

        return (
          <div key={cat.category}>
            <div
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-muted/50"
              onClick={() => {
                // Toggle all fields in category
                if (allSelected) {
                  cat.fields.forEach(f => {
                    if (selectedFields.has(f.key)) onToggle(f.key);
                  });
                } else {
                  cat.fields.forEach(f => {
                    if (!selectedFields.has(f.key)) onToggle(f.key);
                  });
                }
              }}
            >
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={() => {
                  if (allSelected) {
                    cat.fields.forEach(f => { if (selectedFields.has(f.key)) onToggle(f.key); });
                  } else {
                    cat.fields.forEach(f => { if (!selectedFields.has(f.key)) onToggle(f.key); });
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm font-semibold text-foreground">{cat.category}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {cat.fields.filter(f => selectedFields.has(f.key)).length}/{cat.fields.length}
              </span>
            </div>
            <div className="ml-4 mt-1 space-y-0.5">
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
          </div>
        );
      })}
    </div>
  );
}
