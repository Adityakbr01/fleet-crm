import { Button } from "@/components/ui/button";
import { useFetchServices } from "@/features/Service/hooks/use-services";
import ServiceTable from "@/features/Service/components/service-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { SquarePlus, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ServiceList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [previousSearchTerm, setPreviousSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const storeCurrentPage = () => {
    Cookies.set("serviceReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditService = (id) => {
    storeCurrentPage();
    navigate(`/service/service-edit/${id}`);
  };

  // Restore saved return page if user navigated back
  useEffect(() => {
    const savedPage = Cookies.get("serviceReturnPage");
    if (savedPage) {
      Cookies.remove("serviceReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["services"],
            exact: false,
          });
        }
      }, 100);
    }
  }, [queryClient]);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      const isNewSearch =
        searchTerm !== previousSearchTerm && previousSearchTerm !== "";

      if (isNewSearch) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }

      setDebouncedSearchTerm(searchTerm);
      setPreviousSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, previousSearchTerm]);

  // Query Hook
  const {
    data: servicesPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchServices(debouncedSearchTerm, pagination.pageIndex, pagination.pageSize);

  // Parse payload defensively
  const servicesList = servicesPayload?.data?.data || servicesPayload?.data || servicesPayload || [];
  const totalPages = servicesPayload?.data?.last_page || servicesPayload?.last_page || 1;
  const totalRecords = servicesPayload?.data?.total || servicesPayload?.total || servicesList.length;
  const fromRecord = servicesPayload?.data?.from || servicesPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = servicesPayload?.data?.to || servicesPayload?.to || (fromRecord + servicesList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Services List Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full p-4 space-y-4 bg-[#f8f9fa] min-h-screen animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[var(--team-color)]" />
            Vehicle Services
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage garage visits, service costs, and detailed repair logs
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link to="/service/service-create" onClick={storeCurrentPage}>
            <Button className="bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white font-medium shadow-sm transition-all active:scale-[0.98]">
              <SquarePlus className="h-4 w-4 mr-2" /> Log Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Services Table Component */}
      <ServiceTable
        servicesList={servicesList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditService={handleEditService}
      />
    </div>
  );
};

export default ServiceList;
