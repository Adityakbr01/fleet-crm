import { Button } from "@/components/ui/button";
import { useFetchVendors, useUpdateVendorStatus } from "@/features/Vendor/hooks/use-vendors";
import VendorTable from "@/features/Vendor/components/vendor-table";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { SquarePlus, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VendorList = () => {
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
    Cookies.set("vendorReturnPage", (pagination.pageIndex + 1).toString(), {
      expires: 1,
    });
  };

  const handleEditVendor = (id) => {
    storeCurrentPage();
    navigate(`/vendor/vendor-edit/${id}`);
  };

  // Status PATCH switch toggler
  const statusMutation = useUpdateVendorStatus();
  const handleStatusToggle = (id, newStatus) => {
    setTogglingId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `Vendor status updated to ${newStatus}`);
          setTogglingId(null);
          refetch();
        },
        onError: (error) => {
          console.error("Status update error:", error);
          toast.error(
            error.response?.data?.message || "Failed to update vendor status."
          );
          setTogglingId(null);
        },
      }
    );
  };

  // Restore saved return page if user navigated back
  useEffect(() => {
    const savedPage = Cookies.get("vendorReturnPage");
    if (savedPage) {
      Cookies.remove("vendorReturnPage");
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination((prev) => ({ ...prev, pageIndex }));
          queryClient.invalidateQueries({
            queryKey: ["vendors"],
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
    data: vendorsPayload,
    isFetching,
    isError,
    refetch,
  } = useFetchVendors(debouncedSearchTerm, pagination.pageIndex, pagination.pageSize);

  // Parse payload defensively
  const vendorsList = vendorsPayload?.data?.data || vendorsPayload?.data || vendorsPayload || [];
  const totalPages = vendorsPayload?.data?.last_page || vendorsPayload?.last_page || 1;
  const totalRecords = vendorsPayload?.data?.total || vendorsPayload?.total || vendorsList.length;
  const fromRecord = vendorsPayload?.data?.from || vendorsPayload?.from || (pagination.pageIndex * pagination.pageSize + 1);
  const toRecord = vendorsPayload?.data?.to || vendorsPayload?.to || (fromRecord + vendorsList.length - 1);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-destructive font-medium mb-3">
              Error Fetching Vendors List Data
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
            <Store className="h-5 w-5 text-[var(--team-color)]" />
            Vendor Master
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage service garages, spare parts suppliers, and third-party vendors
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link to="/vendor/vendor-create" onClick={storeCurrentPage}>
            <Button className="bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white font-medium shadow-sm transition-all active:scale-[0.98]">
              <SquarePlus className="h-4 w-4 mr-2" /> Add Vendor
            </Button>
          </Link>
        </div>
      </div>

      {/* Vendors Table Component */}
      <VendorTable
        vendorsList={vendorsList}
        isFetching={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        totalRecords={totalRecords}
        fromRecord={fromRecord}
        toRecord={toRecord}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEditVendor={handleEditVendor}
        onStatusToggle={handleStatusToggle}
        togglingId={togglingId}
      />
    </div>
  );
};

export default VendorList;
