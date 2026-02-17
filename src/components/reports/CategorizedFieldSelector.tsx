import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { REPORT_FIELD_CATEGORIES } from "@/lib/report-fields";

interface CategorizedFieldSelectorProps {
  enabledFields: Set<string>;
  onToggle: (fieldKey: string) => void;
}

export function CategorizedFieldSelector({
  enabledFields,
  onToggle,
}: CategorizedFieldSelectorProps) {
  return (
    <Accordion type="multiple" defaultValue={REPORT_FIELD_CATEGORIES.map(c => c.key)} className="w-full">
      {REPORT_FIELD_CATEGORIES.map((category) => {
        const categoryFieldKeys = category.fields.map(f => f.key);
        const enabledCount = categoryFieldKeys.filter(k => enabledFields.has(k)).length;
        const allChecked = enabledCount === categoryFieldKeys.length;
        const someChecked = enabledCount > 0 && !allChecked;

        const handleToggleAll = () => {
          if (allChecked) {
            categoryFieldKeys.forEach(k => {
              if (enabledFields.has(k)) onToggle(k);
            });
          } else {
            categoryFieldKeys.forEach(k => {
              if (!enabledFields.has(k)) onToggle(k);
            });
          }
        };

        return (
          <AccordionItem key={category.key} value={category.key} className="border-b-0">
            <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={handleToggleAll}
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{category.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({enabledCount}/{categoryFieldKeys.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-2 space-y-0.5">
                {category.fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-muted/50"
                    onClick={() => onToggle(field.key)}
                  >
                    <Checkbox
                      checked={enabledFields.has(field.key)}
                      onCheckedChange={() => onToggle(field.key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm">{field.label}</span>
                    {field.unit && (
                      <span className="text-xs text-muted-foreground">({field.unit})</span>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
