"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  X,
  Download,
  Columns,
  Filter,
  Inbox,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  maxWidth?: string;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  hiddenFromToggle?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  searchValue?: (row: T) => string;
  filterValue?: (row: T) => any;
}

interface CommonTableProps<T> {
  data?: T[];
  columns?: Column<T>[];
  loading?: boolean;
  striped?: boolean;
  hover?: boolean;
  responsive?: boolean;
  perPage?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  className?: string;
  cardHeader?: React.ReactNode;
  minHeight?: string;
  resizable?: boolean;
  sortable?: boolean;
  showColumnToggle?: boolean;
  showPerPageSelector?: boolean;
  exportable?: boolean;
  selectableRows?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  rowClickable?: boolean;
  getRowId?: (row: T) => string;
}

function CommonTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  loading = false,
  striped = false,
  hover = true,
  responsive = true,
  perPage = 10,
  showPagination = true,
  showSearch = true,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyIcon = <Inbox className="w-12 h-12" />,
  emptyAction = null,
  className = "",
  cardHeader = null,
  minHeight = "",
  resizable = true,
  sortable = true,
  showColumnToggle = true,
  showPerPageSelector = true,
  exportable = false,
  selectableRows = false,
  onSelectionChange = undefined,
  onRowClick = undefined,
  rowClickable = true,
  getRowId = (row: T) => row._id || row.id,
}: CommonTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<number, boolean>>(
    () => columns.reduce((acc, _, index) => ({ ...acc, [index]: true }), {}),
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPerPage, setCurrentPerPage] = useState(perPage);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState<{
    columnIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, any[]>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<number | null>(
    null,
  );
  const [filterSearchTerms, setFilterSearchTerms] = useState<
    Record<string, string>
  >({});
  const [isMobile, setIsMobile] = useState(false);
  const [showSearchColumnDropdown, setShowSearchColumnDropdown] =
    useState(false);
  const [showColumnToggleDropdown, setShowColumnToggleDropdown] =
    useState(false);
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  const getDistinctValues = (column: Column<T>) => {
    const values = data
      .map((row) => {
        if (column.filterValue) return column.filterValue(row);
        return getNestedValue(row, column.key);
      })
      .filter((value) => value !== null && value !== undefined);

    return [...new Set(values)].sort((a, b) => {
      if (typeof a === "string" && typeof b === "string")
        return a.localeCompare(b);
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  const handleFilterChange = (
    columnKey: string,
    value: any,
    checked: boolean,
  ) => {
    setColumnFilters((prev) => {
      const currentFilters = prev[columnKey] || [];
      const newFilters = checked
        ? [...currentFilters, value]
        : currentFilters.filter((f) => f !== value);

      if (newFilters.length === 0) {
        const { [columnKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [columnKey]: newFilters };
    });
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters((prev) => {
      const { [columnKey]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleAllValues = (
    columnKey: string,
    distinctValues: any[],
    selectAll: boolean,
  ) => {
    if (selectAll) {
      setColumnFilters((prev) => ({
        ...prev,
        [columnKey]: [...distinctValues],
      }));
    } else {
      clearColumnFilter(columnKey);
    }
    setCurrentPage(1);
  };

  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    if (!resizable || isMobile) return;
    e.preventDefault();
    setIsResizing(true);
    setResizeData({
      columnIndex,
      startX: e.clientX,
      startWidth: (e.target as HTMLElement).parentElement!.offsetWidth,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeData) return;
      const diff = e.clientX - resizeData.startX;
      const newWidth = Math.max(80, resizeData.startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizeData.columnIndex]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeData(null);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, resizeData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".filter-dropdown")) {
        setOpenFilterDropdown(null);
      }
      if (!(event.target as Element).closest(".search-column-dropdown")) {
        setShowSearchColumnDropdown(false);
      }
      if (!(event.target as Element).closest(".column-toggle-dropdown")) {
        setShowColumnToggleDropdown(false);
      }
      if (!(event.target as Element).closest(".per-page-dropdown")) {
        setShowPerPageDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleRowClick = (row: T, event: React.MouseEvent) => {
    if (
      (event.target as Element).closest(
        'input[type="checkbox"], button, a, .filter-dropdown',
      )
    ) {
      return;
    }
    if (onRowClick && rowClickable) onRowClick(row);
  };

  const handleRowSelect = (
    rowId: string,
    checked: boolean,
    event: React.ChangeEvent,
  ) => {
    if (!selectableRows) return;
    event.stopPropagation();
    const newSelection = new Set(selectedRows);
    checked ? newSelection.add(rowId) : newSelection.delete(rowId);
    setSelectedRows(newSelection);
    if (onSelectionChange) onSelectionChange(Array.from(newSelection));
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectableRows) return;
    const newSelection = checked
      ? new Set(currentData.map((row) => getRowId(row)))
      : new Set<string>();
    setSelectedRows(newSelection);
    if (onSelectionChange) onSelectionChange(Array.from(newSelection));
  };

  const processedData = useMemo(() => {
    let filtered = [...data];

    Object.entries(columnFilters).forEach(([columnKey, selectedValues]) => {
      if (selectedValues.length > 0) {
        const column = columns.find((col) => col.key === columnKey);
        if (column) {
          filtered = filtered.filter((row) => {
            const value = column.filterValue
              ? column.filterValue(row)
              : getNestedValue(row, column.key);
            return selectedValues.includes(value);
          });
        }
      }
    });

    if (searchTerm.trim()) {
      filtered = filtered.filter((row) => {
        if (searchColumn === "all") {
          return columns.some((column) => {
            const value = column.searchValue
              ? column.searchValue(row)
              : getNestedValue(row, column.key);
            return (
              value &&
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        } else {
          const column = columns.find((col) => col.key === searchColumn);
          if (!column) return true;
          const value = column.searchValue
            ? column.searchValue(row)
            : getNestedValue(row, column.key);
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key!);
        const bValue = getNestedValue(b, sortConfig.key!);
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, searchColumn, sortConfig, columns, columnFilters]);

  const totalPages = Math.ceil(processedData.length / currentPerPage);
  const startIndex = (currentPage - 1) * currentPerPage;
  const endIndex = startIndex + currentPerPage;
  const currentData = useMemo(
    () =>
      showPagination
        ? processedData.slice(startIndex, endIndex)
        : processedData,
    [processedData, startIndex, endIndex, showPagination],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchColumn, currentPerPage]);

  const handleExport = () => {
    if (!exportable) return;
    const visibleCols = columns.filter((_, i) => visibleColumns[i]);
    const csvContent = [
      visibleCols.map((col) => col.header).join(","),
      ...processedData.map((row) =>
        visibleCols
          .map((col) => `"${getNestedValue(row, col.key) || ""}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchableColumns = columns.filter(
    (col) => col.searchable !== false && col.key !== "actions",
  );

  const visibleColumnsList = columns.filter((_, i) => visibleColumns[i]);

  const renderFilterDropdown = (column: Column<T>, originalIndex: number) => {
    if (!column.filterable) return null;

    const distinctValues = getDistinctValues(column);
    const selectedFilters = columnFilters[column.key] || [];
    const isOpen = openFilterDropdown === originalIndex;
    const hasActiveFilter = selectedFilters.length > 0;
    const searchTerm = filterSearchTerms[column.key] || "";

    const filteredValues = distinctValues.filter((value) => {
      if (!searchTerm) return true;
      const displayValue =
        value === null || value === undefined ? "(blank)" : String(value);
      return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const allSelected = selectedFilters.length === filteredValues.length;

    return (
      <div className="filter-dropdown inline-block relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenFilterDropdown(isOpen ? null : originalIndex);
            if (isOpen) {
              setFilterSearchTerms((prev) => ({ ...prev, [column.key]: "" }));
            }
          }}
          className={`ml-1 p-0 border-none bg-transparent text-xs ${
            hasActiveFilter ? "text-blue-600" : "text-muted-foreground"
          } hover:text-blue-700 transition-colors`}
        >
          <Filter
            className={`w-3 h-3 ${hasActiveFilter ? "fill-current" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 top-full mt-1 w-64 bg-card rounded-lg shadow-xl border border-border z-50 max-h-80 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-border flex justify-between items-center">
              <span className="text-xs font-bold text-foreground uppercase">
                Filter {column.header}
              </span>
              {hasActiveFilter && (
                <button
                  onClick={() => clearColumnFilter(column.key)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) =>
                  setFilterSearchTerms((prev) => ({
                    ...prev,
                    [column.key]: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 text-sm border border-border bg-input text-foreground rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="border-t border-border" />

            {filteredValues.length > 0 && (
              <>
                <label
                  className="flex items-center px-4 py-2 hover:bg-secondary cursor-pointer"
                  onClick={() =>
                    toggleAllValues(column.key, filteredValues, !allSelected)
                  }
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {}}
                    className="mr-2 pointer-events-none"
                  />
                  <span className="text-sm text-foreground">
                    {allSelected ? "Deselect All" : "Select All"}
                  </span>
                </label>
                <div className="border-t border-border" />
              </>
            )}

            {filteredValues.map((value, index) => {
              const isSelected = selectedFilters.includes(value);
              const displayValue =
                value === null || value === undefined
                  ? "(blank)"
                  : String(value);

              return (
                <label
                  key={index}
                  className="flex items-center px-4 py-2 hover:bg-secondary cursor-pointer"
                  onClick={() =>
                    handleFilterChange(column.key, value, !isSelected)
                  }
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mr-2 pointer-events-none"
                  />
                  <span className="text-sm text-foreground">
                    {displayValue}
                  </span>
                </label>
              );
            })}

            {filteredValues.length === 0 && searchTerm && (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No values match "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSearchBar = () => {
    if (!showSearch || loading) return null;

    const activeFiltersCount = Object.keys(columnFilters).length;

    return (
      <div className="mb-4">
        <div
          className={`flex gap-3 items-center ${isMobile ? "flex-col" : ""}`}
        >
          <div className={isMobile ? "w-full" : "flex-1"}>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div
                className={`search-column-dropdown relative ${
                  isMobile ? "w-full" : ""
                }`}
              >
                <button
                  onClick={() =>
                    setShowSearchColumnDropdown(!showSearchColumnDropdown)
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm border border-border bg-card text-foreground rounded hover:bg-secondary ${
                    isMobile ? "w-full justify-between" : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>
                    {searchColumn === "all"
                      ? "All Columns"
                      : columns.find((col) => col.key === searchColumn)?.header}
                  </span>
                </button>

                {showSearchColumnDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSearchColumn("all");
                        setShowSearchColumnDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
                    >
                      All Columns
                    </button>
                    <div className="border-t border-border" />
                    {searchableColumns.map((col) => (
                      <button
                        key={col.key}
                        onClick={() => {
                          setSearchColumn(col.key);
                          setShowSearchColumnDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        {col.header}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-border bg-input text-foreground rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary rounded"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={isMobile ? "w-full" : ""}>
            <div
              className={`flex gap-2 ${isMobile ? "flex-wrap" : "justify-end"}`}
            >
              {showPerPageSelector && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <div className="per-page-dropdown relative">
                    <button
                      onClick={() =>
                        setShowPerPageDropdown(!showPerPageDropdown)
                      }
                      className="px-3 py-2 text-sm border border-border bg-card text-foreground rounded hover:bg-secondary"
                    >
                      {currentPerPage}
                    </button>
                    {showPerPageDropdown && (
                      <div className="absolute left-0 top-full mt-1 bg-card rounded-lg shadow-lg border border-border z-50">
                        {[5, 10, 25, 50, 100].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setCurrentPerPage(num);
                              setShowPerPageDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showColumnToggle && !isMobile && (
                <div className="column-toggle-dropdown relative">
                  <button
                    onClick={() =>
                      setShowColumnToggleDropdown(!showColumnToggleDropdown)
                    }
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-border bg-card text-foreground rounded hover:bg-secondary"
                  >
                    <Columns className="w-4 h-4" />
                    <span>Columns</span>
                  </button>
                  {showColumnToggleDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
                      {columns
                        .map((col, i) => ({ col, i }))
                        .filter(({ col }) => !col.hiddenFromToggle)
                        .map(({ col, i }) => (
                          <label
                            key={i}
                            className="flex items-center px-4 py-2 hover:bg-secondary cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns[i]}
                              onChange={(e) => {
                                e.stopPropagation();
                                setVisibleColumns((prev) => ({
                                  ...prev,
                                  [i]: !prev[i],
                                }));
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-foreground">
                              {col.header}
                            </span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {exportable && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-green-500 text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Download className="w-4 h-4" />
                  {!isMobile && <span>Export</span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {(selectedRows.size > 0 || activeFiltersCount > 0) && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {selectedRows.size > 0 && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full">
                {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""}{" "}
                selected
              </span>
            )}
            {activeFiltersCount > 0 && (
              <>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm rounded-full">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                  active
                </span>
                <button
                  onClick={() => setColumnFilters({})}
                  className="px-3 py-1 text-sm border border-yellow-500 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMobileCard = (row: T, rowIndex: number) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.has(rowId);

    return (
      <div
        key={rowId}
        className={`mb-3 bg-card rounded-lg border ${
          isSelected ? "border-blue-500" : "border-border"
        } p-4 shadow-sm`}
        onClick={(e) => handleRowClick(row, e)}
        style={{
          cursor:
            typeof onRowClick === "function" && rowClickable
              ? "pointer"
              : "default",
        }}
      >
        {selectableRows && (
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleRowSelect(rowId, e.target.checked, e)}
                className="mr-2"
              />
              <span className="text-sm text-foreground">Select</span>
            </label>
          </div>
        )}
        {visibleColumnsList.map((column, colIndex) => {
          const value = column.render
            ? column.render(row, rowIndex + startIndex)
            : getNestedValue(row, column.key);

          return (
            <div key={colIndex} className="mb-2">
              <strong className="text-muted-foreground text-sm block">
                {column.header}
              </strong>
              <div className="text-foreground">{value}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-muted-foreground">Loading data...</p>
        </div>
      );
    }

    if (processedData.length === 0 && searchTerm) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto" />
          <h5 className="mt-3 text-muted-foreground font-medium">
            No results found
          </h5>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground mx-auto flex justify-center">
            {emptyIcon}
          </div>
          <h5 className="mt-3 text-muted-foreground font-medium">
            {emptyMessage}
          </h5>
          {emptyAction}
        </div>
      );
    }

    if (isMobile) {
      return (
        <div>
          {currentData.map((row, index) => renderMobileCard(row, index))}
        </div>
      );
    }

    const TableWrapper = responsive
      ? ({ children }: { children: React.ReactNode }) => (
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              minHeight: minHeight || "auto",
            }}
          >
            {children}
          </div>
        )
      : ({ children }: { children: React.ReactNode }) => <>{children}</>;

    return (
      <TableWrapper>
        <table
          ref={tableRef}
          className={`w-full text-sm text-left ${className}`}
          style={{ tableLayout: "auto", minWidth: "100%" }}
        >
          <thead className="bg-secondary border-b border-border">
            <tr>
              {selectableRows && (
                <th className="px-4 py-3" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={
                      currentData.length > 0 &&
                      currentData.every((row) =>
                        selectedRows.has(getRowId(row)),
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {visibleColumnsList.map((column, index) => {
                const originalIndex = columns.indexOf(column);
                const width = columnWidths[originalIndex] || column.width;

                return (
                  <th
                    key={originalIndex}
                    style={{ width, position: "relative" }}
                    className={`px-4 py-3 font-medium text-foreground ${
                      column.headerClassName || ""
                    }`}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span>{column.header}</span>
                        {renderFilterDropdown(column, originalIndex)}
                      </div>
                      {sortable && column.sortable !== false && (
                        <span className="ml-2">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
                          )}
                        </span>
                      )}
                    </div>

                    {resizable && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          cursor: "col-resize",
                        }}
                        className="border-r-2 border-border hover:border-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, originalIndex)}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowIndex}
                  className={`${
                    striped && rowIndex % 2 === 0
                      ? "bg-secondary/50"
                      : "bg-card"
                  } ${hover ? "hover:bg-secondary" : ""} ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  } transition-colors`}
                  style={{
                    cursor:
                      typeof onRowClick === "function" && rowClickable
                        ? "pointer"
                        : "default",
                  }}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  {selectableRows && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleRowSelect(rowId, e.target.checked, e)
                        }
                      />
                    </td>
                  )}
                  {visibleColumnsList.map((column, colIndex) => {
                    const originalIndex = columns.indexOf(column);
                    const width = columnWidths[originalIndex] || column.width;

                    return (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-foreground ${column.cellClassName || ""}`}
                        style={{
                          width,
                          maxWidth: column.maxWidth || "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={
                          column.render
                            ? ""
                            : String(getNestedValue(row, column.key))
                        }
                      >
                        {column.render
                          ? column.render(row, rowIndex + startIndex)
                          : getNestedValue(row, column.key)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
    );
  };

  const renderPagination = () => {
    if (
      !showPagination ||
      totalPages <= 1 ||
      loading ||
      processedData.length === 0
    )
      return null;

    const items = [];
    const maxVisible = isMobile ? 3 : 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 text-sm rounded ${
              i === currentPage
                ? "bg-blue-600 text-white"
                : "bg-card text-foreground hover:bg-secondary border border-border"
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      items.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 text-sm rounded ${
            1 === currentPage
              ? "bg-blue-600 text-white"
              : "bg-card text-foreground hover:bg-secondary border border-border"
          }`}
        >
          1
        </button>,
      );

      if (currentPage > 3)
        items.push(
          <span key="start-ellipsis" className="px-2">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </span>,
        );

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 text-sm rounded ${
              i === currentPage
                ? "bg-blue-600 text-white"
                : "bg-card text-foreground hover:bg-secondary border border-border"
            }`}
          >
            {i}
          </button>,
        );
      }

      if (currentPage < totalPages - 2)
        items.push(
          <span key="end-ellipsis" className="px-2">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </span>,
        );

      if (totalPages > 1) {
        items.push(
          <button
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-3 py-1 text-sm rounded ${
              totalPages === currentPage
                ? "bg-blue-600 text-white"
                : "bg-card text-foreground hover:bg-secondary border border-border"
            }`}
          >
            {totalPages}
          </button>,
        );
      }
    }

    return (
      <div
        className={`bg-card border-t border-border px-4 py-3 flex ${
          isMobile ? "flex-col gap-3" : "justify-between items-center"
        }`}
      >
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)}{" "}
          of {processedData.length} entries
          {(searchTerm || Object.keys(columnFilters).length > 0) && (
            <span> (filtered from {data.length} total)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 rounded border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1 rounded border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {items}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1 rounded border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1 rounded border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {cardHeader && (
        <div className="bg-card border-b border-border px-4 py-3">
          {cardHeader}
        </div>
      )}
      <div className={showSearch ? "p-4" : "p-0"}>
        {renderSearchBar()}
        {renderTable()}
      </div>
      {renderPagination()}
    </div>
  );
}

export default CommonTable;
