import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ListFieldInputProps {
  label: string;
  required?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

export function ListFieldInput({
  label,
  required,
  items,
  onChange,
  placeholder = "항목을 입력하세요",
  isInvalid,
}: ListFieldInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={isInvalid ? "border-destructive" : ""}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {isInvalid && items.length === 0 && (
        <p className="text-xs text-destructive">최소 1개 항목을 추가해주세요</p>
      )}
    </div>
  );
}
