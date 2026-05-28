import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import moment from "moment";
import {
  Users,
  Car,
  Route,
  Calendar as CalendarIcon,
  TrendingUp,
  ClipboardCheck,
  Ban,
  Search,
  Wallet,
  RefreshCcw,
  Clock,
  Activity,
  CreditCard,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Home = () => {
  const currentYear = moment().year();
  const currentMonthName = moment().format("MMMM");

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [searchTerm, setSearchTerm] = useState("");

  const token = Cookies.get("token");

  const getSyncColorClass = (apiDateStr) => {
    if (!apiDateStr) return "text-slate-500";
    const cleanDateStr = `${apiDateStr}`.replace(" IST", "");
    const apiMoment = moment(cleanDateStr);
    if (!apiMoment.isValid()) return "text-slate-500";

    const currentStart = moment().startOf("day");
    const apiStart = apiMoment.clone().startOf("day");
    const diffDays = currentStart.diff(apiStart, "days");

    if (diffDays <= 0) {
      return "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold inline-block";
    } else if (diffDays === 1) {
      return "text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold inline-block";
    } else {
      return "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold inline-block";
    }
  };

  const getSyncDateStripClass = (apiDateStr) => {
    const baseClass = "mt-1 block w-full rounded-sm px-2 py-1 text-xs font-bold";
    if (!apiDateStr) return `${baseClass} bg-slate-50 text-slate-500`;

    const cleanDateStr = `${apiDateStr}`.replace(" IST", "");
    const apiMoment = moment(cleanDateStr);
    if (!apiMoment.isValid()) {
      return `${baseClass} bg-slate-50 text-slate-500`;
    }

    const diffDays = moment()
      .startOf("day")
      .diff(apiMoment.clone().startOf("day"), "days");

    if (diffDays <= 0) return `${baseClass} bg-emerald-50 text-emerald-600`;
    if (diffDays === 1) return `${baseClass} bg-amber-50 text-amber-600`;
    return `${baseClass} bg-rose-50 text-rose-600`;
  };

  const formatSyncDate = (apiDateStr) => {
    if (!apiDateStr) return "N/A";
    const cleanDateStr = `${apiDateStr}`.replace(" IST", "");
    const parsedDate = moment(cleanDateStr);
    return parsedDate.isValid()
      ? parsedDate.format("DD-MM-YY")
      : apiDateStr;
  };

  // Generate years from 2025 to current year
  const years = useMemo(() => {
    const startYear = 2025;
    const yearList = [];
    for (let y = startYear; y <= currentYear; y++) {
      yearList.push(y.toString());
    }
    return yearList;
  }, [currentYear]);

  // Generate months based on selected year
  const months = useMemo(() => {
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (parseInt(selectedYear) === currentYear) {
      const currentMonthIndex = moment().month(); // 0-indexed
      return allMonths.slice(0, currentMonthIndex + 1);
    }

    return allMonths;
  }, [selectedYear, currentYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const yearMonthString = `${selectedYear} ${selectedMonth}`;
      const response = await axios.post(
        `${BASE_URL}/api/dashboard`,
        { year_month: yearMonthString },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const topStats = [
    {
      title: "Total Trips",
      value: dashboardData?.data?.totalTrips || 0,
      icon: Route,
      color: "bg-blue-500",
      link: "/trip",
    },
    {
      title: "Total Drivers",
      value: dashboardData?.data?.totalDrivers || 0,
      icon: Users,
      color: "bg-purple-500",
      link: "/driver",
    },
    {
      title: "Vehicle",
      value: dashboardData?.data?.totalVehicles || 0,
      icon: Car,
      color: "bg-emerald-500",
      link: "/vehicle",
    },
    {
      title: "Pending QR",
      value: dashboardData?.data?.pendingDriverQR || 0,
      icon: ClipboardCheck,
      color: "bg-amber-500",
      link: "/vehicle",
    },
  ];

  // Financial calculations
  const totalPenalty = useMemo(() => {
    const items = dashboardData?.data?.totalDriverPenalty || [];
    return items.reduce(
      (acc, curr) => acc + parseFloat(curr.totalPenalty || 0),
      0,
    );
  }, [dashboardData]);

  const totalDeposit = useMemo(() => {
    const items = dashboardData?.data?.totalDriverDeposit || [];
    // Note: API uses 'totalDeposity'
    return items.reduce(
      (acc, curr) => acc + parseFloat(curr.totalDeposity || 0),
      0,
    );
  }, [dashboardData]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const graphData = dashboardData?.data?.graph1 || [];
    return {
      labels: graphData.map((item) => item.trip_product_type),
      datasets: [
        {
          label: "Total Trips",
          data: graphData.map((item) => item.totalTrips),
          backgroundColor: "rgba(59, 130, 246, 0.8)", // blue-500
          borderRadius: 6,
        },
        {
          label: "Completed Trips",
          data: graphData.map((item) => parseInt(item.completedTrips)),
          backgroundColor: "rgba(16, 185, 129, 0.8)", // emerald-500
          borderRadius: 6,
        },
      ],
    };
  }, [dashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // Table Data Filtering
  const filteredTrips = useMemo(() => {
    const trips = dashboardData?.data?.tripsDetails || [];
    if (!searchTerm) return trips;
    return trips.filter(
      (trip) =>
        trip.trip_driver_full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        trip.trip_product_type.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [dashboardData, searchTerm]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-5 bg-[#f8f9fa] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="w-1/1 md:w-1/2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Fleet Analytics
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Comprehensive overview of operations and financial vitals
          </p>
        </div>
        <div className=" w-1/1 md:w-1/2 flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold">Analysis Period:</span>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-9 border-none bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-0 font-medium">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] h-9 border-none bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-0 font-medium">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary layout based on the supplied sketch */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="grid content-start gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topStats.map((stat, index) => (
              <Card
                key={index}
                onClick={() => stat.link && navigate(stat.link)}
                className="group cursor-pointer overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold uppercase text-slate-500">
                      {stat.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="mt-2 h-6 w-20" />
                    ) : (
                      <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {stat.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div
                    className={`${stat.color} shrink-0 rounded-lg p-2 text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}
                  >
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card
              onClick={() => navigate("/deposit")}
              className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900">
                    Driver Deposit
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                    Current analysis period
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-7 w-28" />
                  ) : (
                    <div className="mt-2 text-2xl font-extrabold text-emerald-600">
                      ₹{totalDeposit.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="shrink-0 rounded-lg bg-emerald-500 p-2 text-white shadow-sm transition-transform duration-300 group-hover:rotate-6">
                  <Wallet className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => navigate("/penalty")}
              className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900">
                    Total Penalties
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                    Current analysis period
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-7 w-28" />
                  ) : (
                    <div className="mt-2 text-2xl font-extrabold text-rose-600">
                      ₹{totalPenalty.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="shrink-0 rounded-lg bg-rose-500 p-2 text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6">
                  <Ban className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ANALYTICS SECTION: Chart & Table */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-7">
            {/* Chart Section */}
            <Card className="lg:col-span-4 border-none shadow-md bg-white">
              <CardHeader>
                <CardTitle>Trip Performance Trends</CardTitle>
                <CardDescription>
                  Total vs Completed trips by product type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : dashboardData?.data?.graph1?.length > 0 ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic">
                    No data available for this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="lg:col-span-3 border-none shadow-md bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Driver Trip Details</CardTitle>
                  <CardDescription>Performance by individuals</CardDescription>
                </div>
                <div className="relative w-40">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-xs border-slate-100 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow>
                        <TableHead className="text-xs font-bold font-mono">
                          Driver
                        </TableHead>
                        <TableHead className="text-xs font-bold font-mono">
                          Type
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold font-mono">
                          Completed/Trips
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-8 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredTrips.length > 0 ? (
                        filteredTrips.map((trip, i) => (
                          <TableRow
                            key={i}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <TableCell className="font-medium text-slate-900 py-3">
                              <div className="flex flex-col">
                                <span className="text-xs">
                                  {trip.trip_driver_full_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono uppercase">
                                  {trip.trip_driver_uuid.slice(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold group-hover:bg-slate-200 transition-colors">
                                {trip.trip_product_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-900">
                                  {trip.completedTrips} / {trip.totalTrips}
                                </span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{
                                      width: `${(parseInt(trip.completedTrips) / trip.totalTrips) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center h-24 text-slate-400 italic text-sm"
                          >
                            No results found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <RefreshCcw className="h-5 w-5 text-blue-500" />
              System Synch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Pending Assign
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Uber UUID
                  </p>
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-10 shrink-0" />
                ) : (
                  <div className="shrink-0 text-xl font-bold text-slate-900">
                    {dashboardData?.data?.pending_upload || 0}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">
                  Last Trip Sync
                </p>
                <Clock className="h-5 w-5 shrink-0 text-blue-500" />
              </div>
              {isLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : dashboardData?.data?.last_trip_sync?.length > 0 ? (
                <div className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
                  {dashboardData.data.last_trip_sync.map((sync, i) => {
                    const dateVal =
                      sync["last_trip_request time"] ||
                      sync.last_trip_request_time;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="truncate text-xs font-semibold text-slate-700">
                          {sync.trip_performance_type || "Trip"}
                        </span>
                        <span
                          className={`shrink-0 text-xs ${getSyncColorClass(dateVal)}`}
                        >
                          {formatSyncDate(dateVal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="mt-3 inline-block text-sm italic text-slate-400">
                  No sync data
                </span>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Last Performance Sync
                </p>
              </div>
              {isLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : dashboardData?.data?.last_performance_sync?.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {dashboardData.data.last_performance_sync.map((sync, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                    >
                      <p className="truncate text-sm font-bold text-slate-900">
                        {sync.performance_type || "Performance"}
                      </p>
                      <span
                        className={`shrink-0 text-xs ${getSyncColorClass(sync.last_performance_date)}`}
                      >
                        {formatSyncDate(sync.last_performance_date)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="mt-3 inline-block text-sm italic text-slate-400">
                  No sync data
                </span>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  Last Payments Sync
                </p>
              </div>
              {isLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : dashboardData?.data?.last_payments_sync?.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {dashboardData.data.last_payments_sync.map((sync, i) => (
                    <span
                      key={i}
                      className={getSyncDateStripClass(sync.last_payment_date)}
                    >
                      {formatSyncDate(sync.last_payment_date)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="mt-3 inline-block text-sm italic text-slate-400">
                  No sync data
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>



    </div>
  );
};

export default Home;
