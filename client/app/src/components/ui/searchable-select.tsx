import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import Fuse from "fuse.js";

export interface SearchableSelectOption {
  id: number | string;
  [key: string]: unknown;
}

interface SearchableSelectProps<T extends SearchableSelectOption> {
  options: T[];
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  displayFormat: (option: T) => string;
  searchKeys: string[];
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function SearchableSelect<T extends SearchableSelectOption>({
  options,
  value,
  onChange,
  placeholder = "Search or select...",
  displayFormat,
  searchKeys,
  disabled = false,
  className = "",
  allowEmpty = false,
  emptyLabel = "None",
}: SearchableSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option
  const selectedOption = options.find((opt) => opt.id === value) || null;

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(options, {
    keys: searchKeys,
    threshold: 0.3,
    includeScore: true,
  });

  // Filter options based on search term
  const filteredOptions = searchTerm.trim()
    ? fuse.search(searchTerm).map((result) => result.item)
    : options;

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleSelect = (optionId: number | string | null) => {
    onChange(optionId);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={
            selectedOption && !isOpen
              ? displayFormat(selectedOption)
              : searchTerm
          }
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Loading..." : placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring ${
            disabled ? "opacity-50 cursor-wait" : ""
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedOption && allowEmpty && !disabled && (
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="pointer-events-none text-muted-foreground">
            {isOpen ? (
              <Search className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto bg-card border-border">
          {allowEmpty && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(null);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                value === null ? "bg-accent" : ""
              } border-b border-border`}
              type="button"
            >
              <div className="text-muted-foreground italic">{emptyLabel}</div>
            </button>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-center">
              <span className="text-muted-foreground">No results found</span>
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option.id);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                  value === option.id ? "bg-accent" : ""
                } border-b last:border-b-0 border-border`}
                type="button"
              >
                <div>{displayFormat(option)}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
