import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Check,
  ChevronsUpDown,
  Download,
  Loader,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeeklyPerformanceTable, {
  getWeekLabel,
  getWeeklyClosing,
  numberValue,
  toWeeklyRows,
} from "./components/WeeklyPerformanceTable";

const currentYear = new Date().getFullYear().toString();

const getDriverName = (driver) =>
  driver?.driver_full_name ||
  driver?.full_name ||
  driver?.driver_fullname ||
  [driver?.name, driver?.surname].filter(Boolean).join(" ") ||
  "";

const normalizeDriverResponse = (payload) => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.drivers)) return data.drivers;
  if (Array.isArray(data?.activeDriver)) return data.activeDriver;

  return [];
};

const safeFilePart = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-z0-9_-]+/gi, "_")
    .replace(/^_+|_+$/g, "") || "driver";

const WeeklyPerformanceReport = () => {
  const token = Cookies.get("token");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    weekYear: currentYear,
    driverFullName: "",
  });

  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        setDriversLoading(true);
        const response = await axios.get(`${BASE_URL}/api/activeDriver`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrivers(normalizeDriverResponse(response.data));
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch active drivers",
        );
        setDrivers([]);
      } finally {
        setDriversLoading(false);
      }
    };

    fetchActiveDrivers();
  }, [token]);

  const filteredDrivers = useMemo(() => {
    const search = driverSearchTerm.toLowerCase();

    return drivers.filter((driver) => {
      const name = getDriverName(driver).toLowerCase();
      const uuid = String(driver?.UUID || driver?.uuid || "").toLowerCase();
      return name.includes(search) || uuid.includes(search);
    });
  }, [drivers, driverSearchTerm]);

  const reportRows = useMemo(() => {
    return toWeeklyRows(reportData);
  }, [reportData]);

  const filteredData = useMemo(() => {
    if (!reportRows.length) return [];
    if (!searchQuery) return reportRows;

    const search = searchQuery.toLowerCase();
    return reportRows.filter((row, index) =>
      getWeekLabel(row, index).toLowerCase().includes(search),
    );
  }, [reportRows, searchQuery]);

  const fetchWeeklyPerformanceReport = async () => {
    if (!filters.weekYear) {
      toast.error("Please enter week year");
      return;
    }

    if (!filters.driverFullName) {
      toast.error("Please select driver");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/weekwise-driver-performance-report-after-sync`,
        {
          week_year: filters.weekYear,
          driver_full_name: filters.driverFullName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.data?.length) {
        setReportData(response.data.data);
        toast.success("Weekly Performance Report fetched successfully");
      } else {
        setReportData([]);
        toast.error("No data found for the selected driver and year");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch Weekly Performance Report",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Weekly Performance");

      const headers = [
        "Week",
        "Opening",
        "MBG",
        "Acc%",
        "Tot Earn",
        "Rev Inc",
        "Add Inc",
        "Tot Coll",
        "Tot CD",
        "Tot QD",
        "Cash Bal",
        "Tot Payout",
        "Payout Adj",
        "Credit",
        "Debit",
        "Cust Trips",
        "Final Payout",
        "Paid",
        "Closing",
      ];

      worksheet.mergeCells(1, 1, 1, headers.length);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Weekly Performance Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells(2, 1, 2, headers.length);
      const filterCell = worksheet.getCell(2, 1);
      filterCell.value = `Driver: ${filters.driverFullName}  Year: ${filters.weekYear}`;
      filterCell.alignment = { horizontal: "center", vertical: "middle" };

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEAF2FF" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      filteredData.forEach((row, index) => {
        const closing = getWeeklyClosing(row);

        worksheet.addRow([
          getWeekLabel(row, index),
          numberValue(row.opening_balance),
          numberValue(row.mbg),
          `${row.acceptence || 0}%`,
          numberValue(row.totalearings),
          numberValue(row.totalrevenue),
          numberValue(row.additionalIncentive),
          numberValue(row.totalCashCollected),
          numberValue(row.totalCashDepositAmount),
          numberValue(row.totalQRDepositAmount),
          numberValue(row.cashBalance),
          numberValue(row.totalPayout),
          numberValue(row.payoutAdj),
          numberValue(row.totalCreditAmount),
          numberValue(row.totalDebiitAmount),
          numberValue(row.totalCustomerTipsAmount),
          numberValue(row.finalPayout),
          numberValue(row.driver_payment),
          closing,
        ]);
      });

      worksheet.columns.forEach((column, index) => {
        column.width = index === 0 ? 18 : 16;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `weekly-performance-report_${safeFilePart(filters.driverFullName)}_${
          filters.weekYear
        }.xlsx`,
      );
      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to download Excel");
    }
  };

  const handleDriverSelect = (driver) => {
    setFilters((prev) => ({
      ...prev,
      driverFullName: getDriverName(driver),
    }));
    setReportData(null);
    setSearchQuery("");
    setDriverPopoverOpen(false);
    setDriverSearchTerm("");
  };

  return (
    <div className="w-full mx-auto py-6">
      <Card className="w-full">
        <CardHeader className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mx-0 px-0">
            <CardTitle>Weekly Performance Report</CardTitle>
            {reportData?.length > 0 && (
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search week..."
                  className="pl-9 h-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Select Year</Label>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={filters.weekYear}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    weekYear: event.target.value,
                  }));
                  setReportData(null);
                }}
                className="h-11"
                placeholder="Enter year"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Driver Full Name</Label>
              <Popover
                open={driverPopoverOpen}
                onOpenChange={setDriverPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={driverPopoverOpen}
                    className={cn(
                      "w-full justify-between h-11 font-normal",
                      !filters.driverFullName && "text-muted-foreground",
                    )}
                    disabled={driversLoading}
                  >
                    <span className="truncate">
                      {driversLoading
                        ? "Loading drivers..."
                        : filters.driverFullName || "Select driver"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center border-b px-3 sticky top-0 bg-white">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search driver..."
                        value={driverSearchTerm}
                        onChange={(event) =>
                          setDriverSearchTerm(event.target.value)
                        }
                        className="border-none focus-visible:ring-0 shadow-none h-10 px-0"
                      />
                    </div>
                    <ScrollArea className="h-[250px]">
                      <div className="p-1">
                        {driversLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader className="h-4 w-4 animate-spin text-primary" />
                            <span className="ml-2 text-xs">Loading...</span>
                          </div>
                        ) : filteredDrivers.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground font-medium px-2">
                            No driver found.
                          </div>
                        ) : (
                          filteredDrivers.map((driver, index) => {
                            const driverName = getDriverName(driver);
                            const driverUuid = driver?.UUID || driver?.uuid;

                            return (
                              <button
                                key={
                                  driver?.id ||
                                  driverUuid ||
                                  `${driverName}-${index}`
                                }
                                type="button"
                                className={cn(
                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors",
                                  filters.driverFullName === driverName &&
                                    "bg-accent",
                                )}
                                onClick={() => handleDriverSelect(driver)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5 shrink-0",
                                    filters.driverFullName === driverName
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col flex-1 truncate">
                                  <span className="font-medium truncate">
                                    {driverName || "Unnamed Driver"}
                                  </span>
                                  {driverUuid && (
                                    <span className="text-[10px] text-muted-foreground truncate">
                                      UUID: {driverUuid}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <Button
                onClick={fetchWeeklyPerformanceReport}
                disabled={isLoading}
                className="h-11 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>

            <div>
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="h-11 w-full"
                disabled={isLoading || !filteredData.length}
              >
                <Download className="mr-2 h-4 w-4" />
                Excel Download
              </Button>
            </div>
          </div>

          {filters.driverFullName && (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">
                Driver:{" "}
                <span className="font-medium text-foreground">
                  {filters.driverFullName}
                </span>{" "}
                | Year:{" "}
                <span className="font-medium text-foreground">
                  {filters.weekYear}
                </span>
              </span>
            </div>
          )}

          <div className="mt-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reportData && reportData.length > 0 ? (
              <WeeklyPerformanceTable reportData={filteredData} />
            ) : (
              reportData && (
                <p className="text-center text-muted-foreground py-8">
                  No data available for the selected driver and year
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyPerformanceReport;
