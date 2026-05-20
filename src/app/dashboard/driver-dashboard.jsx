import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { Download, Loader, Search, LayoutDashboard, Mail, Phone, Calendar, Shield, CreditCard, Ban, TrendingUp, Wallet, ArrowLeft, Award, FileSpreadsheet, Percent, Clock, Banknote } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NA = () => <span className="text-muted-foreground text-xs">-</span>;
const fmt = (val) => (val !== null && val !== undefined ? val : null);

const DriverDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDriverForDetails, setSelectedDriverForDetails] =
    useState(null);
  const [driverDetailsData, setDriverDetailsData] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [selectedDriverVehicle, setSelectedDriverVehicle] = useState("");
  const [detailSearchQuery, setDetailSearchQuery] = useState("");

  const token = Cookies.get("token");

  const fetchDriverDetails = async (driverName, vehicleNumber) => {
    try {
      setIsDetailsLoading(true);
      setSelectedDriverForDetails(driverName);
      setSelectedDriverVehicle(vehicleNumber || "");
      
      const formData = new FormData();
      formData.append("full_name", driverName);

      console.log(`[DriverDashboard] Fetching details for driver: "${driverName}"`);
      const response = await axios.post(
        `${BASE_URL}/api/getDriverDetailsDashboard`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("[DriverDashboard] Received driver details data:", response.data);
      if (response?.data) {
        setDriverDetailsData(response.data);
      } else {
        setDriverDetailsData(null);
        toast.error("No details found for this driver");
      }
    } catch (error) {
      console.error("[DriverDashboard] Error fetching driver details:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch driver details",
      );
      setDriverDetailsData(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/getDriverDashboard`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response?.data?.data) {
        setReportData(response.data.data);
      } else {
        setReportData([]);
        toast.error("No data found");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch driver dashboard",
      );
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredData = reportData
    ? reportData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : [];

  const exportToExcel = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Driver Dashboard");

      const dataKeys = getHeaders(filteredData);
      const maxCols = dataKeys.length;

      // 1. Add Title
      worksheet.mergeCells(1, 1, 1, maxCols);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = "Driver Dashboard Report";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 2. Add Generation Date
      worksheet.mergeCells(2, 1, 2, maxCols);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // 3. Header Row
      const headerRow = worksheet.getRow(4);
      headerRow.values = dataKeys.map((key) => formatHeader(key));
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // 4. Add Data Rows
      filteredData.forEach((row) => {
        const rowData = dataKeys.map((key) => {
          const val = row[key];
          if (key === "total_trips") {
            return `${row.total_completed_trips || 0} / ${row.total_trips || 0}`;
          }
          if (key === "balance") {
            return (
              Number(row.finalPayout || 0) - Number(row.driver_payment || 0)
            );
          }
          // Treat specifically as text
          if (key === "driver_full_name" || key === "vehicle_number_plate") {
            return val !== null && val !== undefined ? String(val) : "N/A";
          }
          // If it's in our financial/numeric lists or looks like a number, cast it
          if (val === null || val === undefined || val === "") return 0;
          const num = Number(val);
          return isNaN(num) ? String(val) : num;
        });
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
        });
      });

      // 5. Adjust Column Widths
      worksheet.columns.forEach((col) => {
        col.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `driver_dashboard_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const getHeaders = (data) => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]).filter(
      (key) => key !== "total_completed_trips",
    );

    const tripsIndex = keys.indexOf("total_trips");
    if (tripsIndex !== -1 && keys.includes("driver_payment")) {
      const filtered = keys.filter((k) => k !== "driver_payment");
      const newTripsIndex = filtered.indexOf("total_trips");
      filtered.splice(newTripsIndex + 1, 0, "driver_payment");
      filtered.push("balance");
      return filtered;
    }
    const finalKeys = [...keys, "balance"];
    return finalKeys;
  };

  const formatHeader = (header) => {
    // Specific mappings for misspelled or special keys
    const mappings = {
      totalearings: "Earnings",
      totalrevenue: "Revenue",
      additionalIncentive: "Incentive",
      totalCashCollected: "Cash Collected",
      totalCashDepositAmount: "Cash Deposit",
      totalQRDepositAmount: "QR Deposit",
      totalCreditAmount: "Credit",
      totalDebiitAmount: "Debit",
      totalCustomerTipsAmount: "Customer Tips",
      total_completed_trips: "Completed Trips",
      total_trips: "Trips",
      driver_payment: "Driver Payment",
      finalPayout: "Final Payout",
      balance: "Balance",
      driver_full_name: "Driver Name",
    };

    if (mappings[header]) return mappings[header];

    return header
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .split(/_|\s/) // Split by underscore or space
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  const isFinancial = (key) => {
    const financialKeys = [
      "totalearings",
      "totalrevenue",
      "additionalIncentive",
      "totalCashCollected",
      "totalCashDepositAmount",
      "totalQRDepositAmount",
      "totalCreditAmount",
      "totalDebiitAmount",
      "totalCustomerTipsAmount",
      "driver_payment",
      "total_trips",
      "finalPayout",
      "balance",
    ];
    return financialKeys.includes(key);
  };

  const cellValue = (key, val) => {
    const value = fmt(val);
    if (value === null) return <NA />;

    if (isFinancial(key)) {
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value;
  };

  const details = driverDetailsData?.data;
  const driver = details?.driver;

  const getDriverImage = () => {
    const driverImgObj = details?.image_url?.find(img => img.image_for === "Driver");
    const noImgObj = details?.image_url?.find(img => img.image_for === "No Image");
    
    const baseDriverUrl = driverImgObj?.image_url || "";
    const noImageUrl = noImgObj?.image_url || "https://dfcgroup.in/fleetmanagementapi/public/assets/images/no_image.jpg";
    
    if (driver?.selfie_image && !driver.selfie_image.includes("/tmp/")) {
      const filename = driver.selfie_image.split('/').pop();
      return `${baseDriverUrl}${filename}`;
    }
    return noImageUrl;
  };

  const chartDataEarnings = useMemo(() => {
    const list = details?.graph3 || [];
    return {
      labels: list.map(item => item.performance_date ? new Date(item.performance_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ""),
      datasets: [
        {
          label: "Daily Earnings (₹)",
          data: list.map(item => Number(item.total_earings || 0)),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
          borderRadius: 6,
        }
      ]
    };
  }, [details]);

  const chartDataHours = useMemo(() => {
    const list = details?.graph1 || [];
    return {
      labels: list.map(item => item.performance_date ? new Date(item.performance_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ""),
      datasets: [
        {
          label: "Hours Online (hrs)",
          data: list.map(item => Number(item.hours_online || 0)),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "rgb(99, 102, 241)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        }
      ]
    };
  }, [details]);

  const chartDataConfirmation = useMemo(() => {
    const list = details?.graph2 || [];
    return {
      labels: list.map(item => item.performance_date ? new Date(item.performance_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ""),
      datasets: [
        {
          label: "Confirmation Rate (%)",
          data: list.map(item => Number(item.confirmation_rate || 0)),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "rgb(16, 185, 129)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        }
      ]
    };
  }, [details]);

  const detailChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          font: { size: 11, weight: "500" },
        }
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 10 } }
      }
    }
  };

  const mergedDailyData = useMemo(() => {
    if (!details) return [];
    
    const dailyMap = {};
    
    // Process graph3 (earnings)
    details.graph3?.forEach(item => {
      const date = item.performance_date;
      if (date) {
        dailyMap[date] = {
          date,
          earnings: Number(item.total_earings || 0),
          hours: 0,
          confirmation: null
        };
      }
    });
    
    // Process graph1 (hours_online)
    details.graph1?.forEach(item => {
      const date = item.performance_date;
      if (date) {
        if (!dailyMap[date]) {
          dailyMap[date] = { date, earnings: 0, hours: 0, confirmation: null };
        }
        dailyMap[date].hours = Number(item.hours_online || 0);
      }
    });

    // Process graph2 (confirmation_rate)
    details.graph2?.forEach(item => {
      const date = item.performance_date;
      if (date) {
        if (!dailyMap[date]) {
          dailyMap[date] = { date, earnings: 0, hours: 0, confirmation: null };
        }
        dailyMap[date].confirmation = Number(item.confirmation_rate || 0);
      }
    });

    return Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
  }, [details]);

  const filteredDailyData = useMemo(() => {
    if (!detailSearchQuery) return mergedDailyData;
    return mergedDailyData.filter(row => {
      const formattedDate = row.date ? new Date(row.date).toLocaleDateString().toLowerCase() : "";
      const rawDate = row.date ? row.date.toLowerCase() : "";
      const search = detailSearchQuery.toLowerCase();
      return formattedDate.includes(search) || rawDate.includes(search);
    });
  }, [mergedDailyData, detailSearchQuery]);

  const exportDetailToExcel = async () => {
    if (!filteredDailyData || filteredDailyData.length === 0) {
      toast.error("No daily data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Daily Performance Log");

      worksheet.mergeCells(1, 1, 1, 4);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = `Daily Performance Report: ${selectedDriverForDetails}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells(2, 1, 2, 4);
      const subTitleCell = worksheet.getCell(2, 1);
      subTitleCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      const headers = ["Date", "Daily Earnings (₹)", "Hours Online (hrs)", "Confirmation Rate (%)"];
      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      filteredDailyData.forEach((row) => {
        const rowData = [
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
          Number(row.earnings || 0),
          Number(row.hours || 0),
          row.confirmation !== null ? `${Number(row.confirmation)}%` : "N/A"
        ];
        const newRow = worksheet.addRow(rowData);
        newRow.eachCell((cell, colIndex) => {
          cell.alignment = { vertical: "middle", horizontal: colIndex === 1 ? "left" : "right" };
        });
      });

      worksheet.columns.forEach((col) => {
        col.width = 22;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `daily_performance_${selectedDriverForDetails}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Daily report exported to Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export daily report");
    }
  };

  if (selectedDriverForDetails) {
    return (
      <div className="w-full min-w-0 py-6 pb-20 space-y-6">
        {/* Navigation & Brand Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setSelectedDriverForDetails(null);
                setDriverDetailsData(null);
                setSelectedDriverVehicle("");
                setDetailSearchQuery("");
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
        
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Date: {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {isDetailsLoading ? (
          <Card className="border-none shadow-md bg-white">
            <CardContent className="flex flex-col justify-center items-center py-32 gap-4">
              <Loader className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-slate-500 animate-pulse font-medium text-sm">
                Retrieving driver performance profiles...
              </p>
            </CardContent>
          </Card>
        ) : details ? (
          <>
            {/* Driver Profile Card */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
              <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-800">
                  Driver Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Column 1: Photo & Status */}
                  <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 pr-6 pb-6 md:pb-0">
                    <div className="h-32 w-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-sm">
                      <img
                        src={getDriverImage()}
                        alt={driver?.full_name || selectedDriverForDetails}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const noImgObj = details?.image_url?.find(img => img.image_for === "No Image");
                          e.target.src = noImgObj?.image_url || "https://dfcgroup.in/fleetmanagementapi/public/assets/images/no_image.jpg";
                        }}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Name, Mobile, Email */}
                  <div className="space-y-4 text-sm md:border-r md:border-slate-100 pr-6 pl-4 pb-6 md:pb-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</span>
                      <span className="text-lg font-extrabold text-slate-800 mt-0.5">{driver?.full_name || selectedDriverForDetails}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile</span>
                      <span className="text-slate-700 font-semibold mt-0.5">{driver?.mobile || <span className="text-slate-400 italic">No mobile</span>}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</span>
                      <span className="text-slate-700 font-semibold mt-0.5">{driver?.email || <span className="text-slate-400 italic">No email</span>}</span>
                    </div>
                  </div>

                  {/* Column 3: Licence, Joining Date, Vehicle Assigned */}
                  <div className="space-y-4 text-sm pl-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Licence</span>
                      <span className="text-slate-700 font-semibold mt-0.5">{driver?.dl_no || <span className="text-slate-400 italic">N/A</span>}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</span>
                      <span className="text-slate-700 font-semibold mt-0.5">
                        {driver?.doj ? new Date(driver.doj).toLocaleDateString() : <span className="text-slate-400 italic">N/A</span>}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Assigned</span>
                      <span className="text-slate-700 font-semibold mt-0.5">
                        {selectedDriverVehicle || <span className="text-slate-400 italic">No vehicle assigned</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6 KPI Cards Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {/* Card 1: Total Earning */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Earning
                  </CardTitle>
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                    <Banknote className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                    ₹{Number(details?.totalearnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Overall accumulated driver earnings</p>
                </CardContent>
              </Card>

              {/* Card 2: Last 3 Month Earning */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Last 3 Month Earning
                  </CardTitle>
                  <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-600 transition-transform group-hover:scale-110">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                    ₹{Number(details?.last3MonthsEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Earnings in the last 3 months</p>
                </CardContent>
              </Card>

              {/* Card 3: Last Month Earnings */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Last Month Earnings
                  </CardTitle>
                  <div className="bg-purple-500/10 p-2 rounded-lg text-purple-600 transition-transform group-hover:scale-110">
                    <Calendar className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                    ₹{Number(details?.lastMonthEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Earnings in the last month</p>
                </CardContent>
              </Card>

              {/* Card 4: Total Penalties Count */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Penalties Count
                  </CardTitle>
                  <div className="bg-rose-500/10 p-2 rounded-lg text-rose-600 transition-transform group-hover:scale-110">
                    <Ban className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold tracking-tight text-rose-600">
                    ₹{Number(details?.totalPenalty || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Total driver penalties and charges</p>
                </CardContent>
              </Card>

              {/* Card 5: Total Credit Count */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Credit Count
                  </CardTitle>
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 transition-transform group-hover:scale-110">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold tracking-tight text-emerald-600">
                    ₹{Number(details?.totalCreditAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Total credited amount adjustments</p>
                </CardContent>
              </Card>

              {/* Card 6: Total (Payable / Receivable) */}
              <Card className="border border-slate-200 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total (Payable / Receivable)
                  </CardTitle>
                  <div className={cn(
                    "p-2 rounded-lg transition-transform group-hover:scale-110",
                    (Number(details?.balance || 0) >= 0) ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    <Wallet className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-extrabold tracking-tight",
                    (Number(details?.balance || 0) >= 0) ? "text-emerald-600" : "text-rose-600"
                  )}>
                    ₹{Number(details?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    as on {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stacked Vertical Charts Section - last 10 Days */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  Last 10 Days Performance
                </h3>
              </div>

              <div className="grid gap-6 grid-cols-1">
                {/* Chart 1: login */}
                <Card className="border border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-indigo-500" /> login (Hours Online)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] pt-2">
                    <Line data={chartDataHours} options={detailChartOptions} />
                  </CardContent>
                </Card>

                {/* Chart 2: Acceptance */}
                <Card className="border border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                      <Percent className="h-4 w-4 text-emerald-500" /> Acceptance (Confirmation Rate %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] pt-2">
                    <Line data={chartDataConfirmation} options={detailChartOptions} />
                  </CardContent>
                </Card>

                {/* Chart 3: Earning */}
                <Card className="border border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-blue-500" /> Earning (Daily Earnings ₹)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] pt-2">
                    <Bar data={chartDataEarnings} options={detailChartOptions} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Unified Activity Log Details */}
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-50">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Daily Performance Table</CardTitle>
                  <p className="text-xs text-slate-500">Searchable history with Excel export</p>
                </div>
                <Button
                  onClick={exportDetailToExcel}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1.5 border-slate-200 hover:bg-slate-50"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export
                </Button>
              </CardHeader>
              <div className="p-4 bg-slate-50/50 border-b border-slate-50">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search Date (e.g. 15 Feb)..."
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs border-slate-200 bg-white"
                  />
                </div>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-bold font-mono px-4 py-3">Date</TableHead>
                      <TableHead className="text-right text-xs font-bold font-mono px-4 py-3">Earnings</TableHead>
                      <TableHead className="text-right text-xs font-bold font-mono px-4 py-3">Hours Online</TableHead>
                      <TableHead className="text-right text-xs font-bold font-mono px-4 py-3">Confirmation %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDailyData.length > 0 ? (
                      filteredDailyData.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-xs font-medium text-slate-700 px-4 py-3">
                            {row.date ? new Date(row.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-900 px-4 py-3">
                            ₹{row.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-xs text-slate-650 px-4 py-3 font-mono">
                            {row.hours ? `${row.hours}h` : "0h"}
                          </TableCell>
                          <TableCell className="text-right text-xs px-4 py-3">
                            {row.confirmation !== null ? (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full font-bold text-[10px]",
                                row.confirmation >= 90 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                row.confirmation >= 75 ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                              )}>
                                {row.confirmation}%
                              </span>
                            ) : <span className="text-slate-400 font-mono">-</span>}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-slate-400 italic text-xs">
                          No daily entries match this query
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium italic">
                <span>Showing {filteredDailyData.length} daily logs</span>
                <span>Total of {mergedDailyData.length} records</span>
              </div>
            </Card>
          </>
        ) : (
          <Card className="border-none shadow-md bg-white">
            <CardContent className="py-24 text-center text-slate-500 italic text-sm">
              Unable to load details for this driver. Please try again.
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 py-6 pb-20">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl font-bold text-gray-800">
              Driver Dashboard
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {reportData && reportData.length > 0 && (
              <>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 border-gray-200 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="h-10 border-green-600 text-green-700 hover:bg-green-50 hover:text-black"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Loader className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-500 animate-pulse font-medium">
                Fetching dashboard data...
              </p>
            </div>
          ) : reportData === null ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 italic">Initializing dashboard...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No driver data found
              </p>
              <p className="text-gray-400 text-sm">
                Try a different search term or refresh the page
              </p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[650px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      {getHeaders(reportData).map((header) => (
                        <TableHead
                          key={header}
                          className={cn(
                            "whitespace-nowrap font-bold text-gray-700 px-2 py-2",
                            isFinancial(header) && "text-right",
                          )}
                        >
                          {formatHeader(header)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        {getHeaders(reportData).map((header) => (
                          <TableCell
                            key={header}
                            className={cn(
                              "whitespace-nowrap font-medium text-gray-600 px-2 py-2",
                              isFinancial(header) && "text-right",
                            )}
                          >
                            {header === "driver_full_name" ? (
                              <button
                                onClick={() => fetchDriverDetails(row.driver_full_name, row.vehicle_number_plate)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-left transition-colors"
                              >
                                {row.driver_full_name}
                              </button>
                            ) : header === "total_trips"
                              ? `${row.total_completed_trips || 0} / ${row.total_trips || 0}`
                              : header === "balance"
                                ? cellValue(
                                    header,
                                    Number(row.finalPayout || 0) -
                                      Number(row.driver_payment || 0),
                                  )
                                : cellValue(header, row[header])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 flex items-center justify-end">
        <p className="text-xs text-gray-400 font-medium italic">
          Total Records: {filteredData.length}
        </p>
      </div>
    </div>
  );
};

export default DriverDashboard;
