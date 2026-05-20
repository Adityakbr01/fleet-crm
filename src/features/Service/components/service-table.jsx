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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "lucide-react";
import { useState } from "react";
import moment from "moment";

const ServiceTable = ({
  servicesList = [],
  isFetching = false,
  pagination,
  setPagination,
  totalPages = 1,
  totalRecords = 0,
  fromRecord = 1,
  toRecord = 0,
  searchTerm,
  setSearchTerm,
  onEditService,
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
      accessorKey: "service_date",
      id: "Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs text-slate-700"
        >
          From Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-medium font-mono text-slate-800">
          {row.getValue("Date")
            ? moment(row.getValue("Date")).format("DD-MM-YYYY")
            : "-"}
        </div>
      ),
      size: 110,
    },
    {
      accessorKey: "service_to_date",
      id: "To Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs text-slate-700"
        >
          To Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-medium font-mono text-slate-800">
          {row.getValue("To Date")
            ? moment(row.getValue("To Date")).format("DD-MM-YYYY")
            : "-"}
        </div>
      ),
      size: 110,
    },
    {
      accessorKey: "service_truck_no",
      id: "Vehicle No",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs text-slate-700"
        >
          Vehicle No
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-[13px] font-semibold text-slate-900">
          {row.getValue("Vehicle No")}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "service_vendor_id",
      id: "Garage",
      header: "Garage",
      cell: ({ row }) => {
        const item = row.original;
        const vendorName =
          item.vendor_name ||
          item.vendor?.vendor_name ||
          item.vendor?.name ||
          `Garage ID: ${item.service_vendor_id}`;
        return (
          <div className="text-xs font-medium text-slate-700">{vendorName}</div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "service_bill_no",
      id: "Bill No",
      header: "Bill No",
      cell: ({ row }) => (
        <div className="text-xs font-mono font-medium text-slate-600">
          {row.getValue("Bill No") || "-"}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "service_amount",
      id: "Total Amount",
      header: "Total Amount",
      cell: ({ row }) => {
        const amt = parseFloat(row.getValue("Total Amount") || 0);
        return (
          <div className="text-xs font-bold text-emerald-600">
            ₹{amt.toLocaleString()}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "service_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("Status") || "Active";
        const isFinish =
          status.toLowerCase() === "finish" ||
          status.toLowerCase() === "completed";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isFinish
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}
          >
            {status}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: "service_remarks",
      id: "Remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div
          className="text-xs truncate max-w-[300px] text-slate-500"
          title={row.getValue("Remarks")}
        >
          {row.getValue("Remarks") || "-"}
        </div>
      ),
      size: 300,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="flex flex-row gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditService(id)}
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit/View Service Log</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 80,
    },
  ];

  const table = useReactTable({
    data: servicesList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const handlePageChange = (newPageIndex) => {
    table.setPageIndex(newPageIndex);
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);

    if (value && !isNaN(value)) {
      const pageNum = parseInt(value);
      if (pageNum >= 1 && pageNum <= table.getPageCount()) {
        handlePageChange(pageNum - 1);
      }
    }
  };

  const generatePageButtons = () => {
    const currentPage = pagination.pageIndex + 1;
    const totalPagesCount = table.getPageCount();
    const buttons = [];

    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(0)}
        className="h-8 w-8 p-0 text-xs"
      >
        1
      </Button>,
    );

    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-2 text-slate-400">
          ...
        </span>,
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPagesCount - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPagesCount) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i - 1)}
            className="h-8 w-8 p-0 text-xs"
          >
            {i}
          </Button>,
        );
      }
    }

    if (currentPage < totalPagesCount - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-2 text-slate-400">
          ...
        </span>,
      );
    }

    if (totalPagesCount > 1) {
      buttons.push(
        <Button
          key={totalPagesCount}
          variant={currentPage === totalPagesCount ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPagesCount - 1)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPagesCount}
        </Button>,
      );
    }

    return buttons;
  };

  const TableShimmer = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11">
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-2">
            <div className="h-6 bg-slate-100 rounded w-full"></div>
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
            placeholder="Search services..."
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
                  No services found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400">
          Showing {fromRecord} to {toRecord} of {totalRecords} services
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

export default ServiceTable;
