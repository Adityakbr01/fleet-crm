import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import useNumericInput from "@/hooks/use-numeric-input";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Search,
  Loader,
} from "lucide-react";
import { useState } from "react";

const VendorTable = ({
  vendorsList = [],
  isFetching = false,
  pagination,
  setPagination,
  totalPages = 1,
  totalRecords = 0,
  fromRecord = 1,
  toRecord = 0,
  searchTerm,
  setSearchTerm,
  onEditVendor,
  onStatusToggle,
  togglingId,
}) => {
  const keyDown = useNumericInput();
  const [pageInput, setPageInput] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex =
          pagination.pageIndex * pagination.pageSize + row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: "vendor_name",
      id: "Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs text-slate-700 font-semibold"
        >
          Vendor Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-semibold text-slate-900">
          {row.getValue("Name")}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "vendor_mobile",
      id: "Mobile",
      header: "Mobile",
      cell: ({ row }) => (
        <div className="text-[12px] font-mono text-slate-600">
          {row.getValue("Mobile") || "-"}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "vendor_email",
      id: "Email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-[12px] text-slate-600 truncate max-w-[150px]">
          {row.getValue("Email") || "-"}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "vendor_type",
      id: "Type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("Type") || "Others";
        const isGarage = type === "Garage";
        return (
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold rounded-md px-2.5 py-0.5 border ${
              isGarage
                ? "bg-violet-50 text-violet-700 border-violet-100"
                : "bg-blue-50 text-blue-700 border-blue-100"
            }`}
          >
            {type}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "vendor_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("Status") || "Active";
        const id = row.original.id;
        const isToggling = togglingId === id;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={status === "Active"}
              onCheckedChange={(checked) =>
                onStatusToggle(id, checked ? "Active" : "Inactive")
              }
              disabled={isToggling}
            />
            <span
              className={`text-[11px] font-medium ${
                status === "Active" ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {status}
            </span>
            {isToggling && (
              <Loader className="h-3 w-3 animate-spin text-slate-400" />
            )}
          </div>
        );
      },
      size: 130,
    },
    {
      id: "Action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditVendor(row.original.id)}
          className="h-8 w-8 text-[var(--team-color)] hover:bg-[var(--team-color)]/10 hover:text-[var(--team-color)] rounded-lg"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      size: 70,
    },
  ];

  const table = useReactTable({
    data: vendorsList,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePageChange = (index) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: index,
    }));
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);
    const parsedPage = parseInt(value);
    if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPages) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: parsedPage - 1,
      }));
    }
  };

  const generatePageButtons = () => {
    const pages = [];
    const maxVisible = 3;
    const curPage = pagination.pageIndex;

    let start = Math.max(0, curPage - 1);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={curPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`h-8 w-8 p-0 text-xs rounded-lg ${
            curPage === i
              ? "bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {i + 1}
        </Button>,
      );
    }
    return pages;
  };

  // Spinner loader for table skeleton while loading
  const TableShimmer = () => {
    return Array.from({ length: pagination.pageSize }).map((_, idx) => (
      <TableRow key={idx} className="border-b border-slate-100">
        {columns.map((_, colIdx) => (
          <TableCell key={colIdx} className="px-4 py-3">
            <div className="h-6 bg-slate-100 rounded w-full animate-pulse"></div>
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
              }
            }}
            className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus:border-slate-300 focus:ring-slate-100 rounded-lg"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 text-xs"
            >
              Columns{" "}
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="text-xs capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 text-slate-500 font-semibold text-xs animate-none"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="bg-white">
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-xs text-slate-400 italic"
                >
                  No vendors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400">
          Showing {fromRecord} to {toRecord} of {totalRecords} vendors
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2 border-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {generatePageButtons()}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Go to</span>
            <Input
              type="tel"
              min="1"
              max={table.getPageCount()}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={() => setPageInput("")}
              onKeyDown={keyDown}
              className="w-12 h-8 text-xs border-slate-200"
              placeholder="Page"
            />
            <span>of {table.getPageCount() || 1}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2 border-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorTable;
