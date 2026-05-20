import { Button } from "@/components/ui/button";
import { useFetchServiceTypes, useUpdateServiceTypeStatus } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeTable from "@/features/ServiceType/components/service-type-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { SquarePlus, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ServiceTypeList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [previousSearchTerm, setPreviousSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const storeCurrentPage = () => {
    Cookies.set("serviceTypeReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditServiceType = (id) => {
    storeCurrentPage();
    navigate(`/service-types/service-type-edit/${id}`);
  };

  const statusMutation = useUpdateServiceTypeStatus();
  const handleStatusToggle = (id, newStatus) => {
    setTogglingId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `Service Type status updated to ${newStatus}`);
          setTogglingId(null);
          refetch();
        },
        onError: (error) => {
          console.error("Status update error:", error);
          toast.error(
            error.response?.data?.message || "Failed to update service type status."
          );
          setTogglingId(null);
        },
      }
    );
  };

  useEffect(() => {
    const savedPage = Cookies.get("serviceTypeReturnPage");
    if (savedPage) {
      Cookies.remove("serviceTypeReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["service-types"],
            exact: false,
          });
        }
      }, 100);
    }
  }, [queryClient]);

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

  const {
    data: serviceTypesPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchServiceTypes(debouncedSearchTerm, pagination.pageIndex, pagination.pageSize);

  const serviceTypesList = serviceTypesPayload?.data?.data || serviceTypesPayload?.data || serviceTypesPayload || [];
  const totalPages = serviceTypesPayload?.data?.last_page || serviceTypesPayload?.last_page || 1;
  const totalRecords = serviceTypesPayload?.data?.total || serviceTypesPayload?.total || serviceTypesList.length;
  const fromRecord = serviceTypesPayload?.data?.from || serviceTypesPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = serviceTypesPayload?.data?.to || serviceTypesPayload?.to || (fromRecord + serviceTypesList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Service Types Data
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[var(--team-color)]" />
            Service Types Master
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage different types of services provided for vehicles
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link to="/service-types/service-type-create" onClick={storeCurrentPage}>
            <Button className="bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white font-medium shadow-sm transition-all active:scale-[0.98]">
              <SquarePlus className="h-4 w-4 mr-2" /> Add Service Type
            </Button>
          </Link>
        </div>
      </div>

      <ServiceTypeTable
        serviceTypesList={serviceTypesList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditServiceType={handleEditServiceType}
        onStatusToggle={handleStatusToggle}
        togglingId={togglingId}
      />
    </div>
  );
};

export default ServiceTypeList;
