"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterAndRankMedicines, AutocompleteOption, NEW_TO_OLD_NAME_MAP } from "@/lib/medicines-catalog";

export type { AutocompleteOption };

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Sync initial value label
  React.useEffect(() => {
    const selectedOption = (options || []).find((opt) => opt && opt.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : value || "");
  }, [value, options]);

  // Filter options with core-name priority and alphabetical sorting
  const filteredOptions = React.useMemo(() => {
    return filterAndRankMedicines(searchTerm, options);
  }, [searchTerm, options]);

  // Highlight reset when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to current selected value label if user typed but did not select
        const currentOption = (options || []).find((opt) => opt && opt.value === value);
        setSearchTerm(currentOption ? currentOption.label : value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // If input is cleared, trigger onChange with empty value
    if (e.target.value === "") {
      onChange("");
    }
  };

  const handleSelectOption = (optValue: string, optLabel: string) => {
    onChange(optValue);
    setSearchTerm(optLabel);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const opt = filteredOptions[highlightedIndex];
          handleSelectOption(opt.value, opt.label);
        } else if (filteredOptions.length > 0) {
          // If no specific option highlighted but Enter pressed, select the first match
          const opt = filteredOptions[0];
          handleSelectOption(opt.value, opt.label);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-11 px-3 pr-10 text-sm font-semibold rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
          <ChevronsUpDown className="h-4 w-4" />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto py-1.5 divide-y divide-slate-100">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-500 italic text-center">{emptyMessage}</div>
          ) : (
            filteredOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;
              const hasStock = opt.availableStock !== undefined;
              const isLowStock = hasStock && opt.availableStock! <= 0;
              const oldNameDisplay = opt.oldName || NEW_TO_OLD_NAME_MAP[opt.label];
              
              return (
                <button
                  key={`${opt.value}-${index}`}
                  type="button"
                  onClick={() => handleSelectOption(opt.value, opt.label)}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors",
                    isHighlighted ? "bg-slate-100 text-slate-900" : "",
                    isSelected ? "bg-primary/5 font-bold text-primary" : "text-slate-700 font-semibold",
                    "hover:bg-slate-50"
                  )}
                >
                  <div className="truncate flex flex-col min-w-0 pr-2">
                    <span className="truncate font-semibold text-slate-900 text-sm">{opt.label}</span>
                    {oldNameDisplay && (
                      <span className="text-[11px] font-normal text-slate-400 truncate">
                        Formerly: <span className="italic font-medium text-slate-500">{oldNameDisplay}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {hasStock && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        isLowStock ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      )}>
                        {opt.availableStock} in stock
                      </span>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
