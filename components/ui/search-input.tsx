"use client";

import * as React from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/use-debounce";

export interface SearchInputProps
  extends Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "value" | "onChange"
  > {
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Standardized search input component with debouncing and fuzzy search support
 * Can be used standalone or integrated with useFuzzySearch hook
 */
export function SearchInput({
  value = "",
  onValueChange,
  onSearch,
  debounceMs = 300,
  showClearButton = true,
  placeholder = "Search...",
  className,
  ...props
}: SearchInputProps) {
  const [search, setSearch] = React.useState(value ?? "");
  const [previousSearch, setPreviousSearch] = React.useState(search);

  const debouncedSearch = React.useCallback(() => {
    if (!onValueChange) return;
    if (search === previousSearch) return;
    setPreviousSearch(search);
    if (search.length === 0) {
      onValueChange("");
      return;
    }
    if (search.length < 3) {
      return;
    }
    onValueChange(search);
  }, [onValueChange, search, previousSearch]);

  React.useEffect(() => {
    if (value !== undefined) {
      setSearch(value);
    }
  }, [value]);

  useDebounce(debouncedSearch, debounceMs);

  return (
    <InputGroup className={cn("w-full", className)}>
      <InputGroupAddon align="inline-start">
        <IconSearch className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        {...props}
      />
      {showClearButton && search && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setSearch("");
              onValueChange?.("");
            }}
            type="button"
            aria-label="Clear search"
          >
            <IconX className="h-4 w-4" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
