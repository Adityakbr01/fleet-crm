import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteSubService,
  useFetchActiveVehicles,
  useFetchActiveVendors,
  useFetchService,
  useUpdateService,
} from "@/features/Service/hooks/use-services";
import ServiceForm from "@/features/Service/forms/service-form";
import SubServiceTable from "@/features/Service/components/sub-service-table";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [subToDelete, setSubToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    service_date: "",
    service_to_date: "",
    service_truck_no: "",
    service_vendor_id: "",
    service_bill_no: "",
    service_amount: "0",
    service_remarks: "",
    service_status: "Active",
  });

  const [subs, setSubs] = useState([]);
  const [errors, setErrors] = useState({});

  // 1. Fetch Service details
  const {
    data: servicePayload,
    isLoading: serviceLoading,
    isError: serviceError,
    refetch,
  } = useFetchService(id);
  const serviceData = servicePayload?.data || servicePayload;

  // Initialize form state when details payload resolves
  useEffect(() => {
    if (serviceData) {
      setFormData({
        service_date: serviceData.service_date || "",
        service_to_date: serviceData.service_to_date || "",
        service_truck_no: serviceData.service_truck_no || "",
        service_vendor_id: serviceData.service_vendor_id?.toString() || "",
        service_bill_no: serviceData.service_bill_no || "",
        service_amount: serviceData.service_amount || "0",
        service_remarks: serviceData.service_remarks || "",
        service_status: serviceData.service_status || "Active",
      });

      const rawSubs =
        serviceData.service_sub ||
        serviceData.serviceSub ||
        serviceData.subs ||
        [];
      setSubs(
        rawSubs.map((sub) => ({
          id: sub.id,
          service_sub_types: sub.service_sub_types || "",
          service_sub_amount: sub.service_sub_amount || "0",
          service_sub_description: sub.service_sub_description || "",
        })),
      );
    }
  }, [serviceData]);

  // Automatically compute service_amount based on sum of subs
  useEffect(() => {
    const total = subs.reduce((sum, item) => {
      const amt = parseFloat(item.service_sub_amount) || 0;
      return sum + amt;
    }, 0);
    setFormData((prev) => ({ ...prev, service_amount: total.toString() }));
  }, [subs]);

  // 2. Fetch lookup data
  const { data: activeVehicles = [], isLoading: vehiclesLoading } =
    useFetchActiveVehicles();
  const { data: activeVendors = [], isLoading: vendorsLoading } =
    useFetchActiveVendors();

  // 3. Mutations
  const updateMutation = useUpdateService(id);
  const deleteSubMutation = useDeleteSubService();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Manage dynamic sub services rows state
  const handleAddSubRow = () => {
    setSubs((prev) => [
      ...prev,
      {
        id: null,
        service_sub_types: "",
        service_sub_amount: "0",
        service_sub_description: "",
      },
    ]);
  };

  const handleSubChange = (index, field, value) => {
    setSubs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteSubRow = (index) => {
    const targetSub = subs[index];
    if (targetSub.id) {
      setSubToDelete({ index, id: targetSub.id });
      setIsConfirmOpen(true);
    } else {
      setSubs((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const confirmDeleteSub = () => {
    if (subToDelete?.id) {
      deleteSubMutation.mutate(subToDelete.id, {
        onSuccess: () => {
          toast.success("Sub-service item deleted successfully!");
          setSubs((prev) => prev.filter((_, idx) => idx !== subToDelete.index));
          setIsConfirmOpen(false);
          setSubToDelete(null);
          refetch(); // Invalidate local query cache and refetch new total bills
        },
        onError: (err) => {
          console.error("Failed to delete sub item:", err);
          toast.error(
            err.response?.data?.message || "Failed to delete sub-service item.",
          );
          setIsConfirmOpen(false);
          setSubToDelete(null);
        },
      });
    }
  };

  // Validations
  const validateForm = () => {
    const newErrors = {};
    if (!formData.service_date) newErrors.service_date = "From date is required";
    if (!formData.service_to_date) newErrors.service_to_date = "To date is required";
    if (!formData.service_truck_no) newErrors.service_truck_no = "Vehicle number is required";
    if (!formData.service_vendor_id) newErrors.service_vendor_id = "Garage/Vendor is required";
    if (!formData.service_bill_no) newErrors.service_bill_no = "Bill number is required";
    if (!formData.service_amount || isNaN(formData.service_amount) || parseFloat(formData.service_amount) < 0) {
      newErrors.service_amount = "Amount must be a valid positive number";
    }

    if (subs.length === 0) {
      toast.error("Please add at least one service item row.");
      return false;
    }

    const subErrors = [];
    subs.forEach((sub, index) => {
      if (!sub.service_sub_types) {
        toast.error(`Service type is required for row #${index + 1}`);
        subErrors.push(index);
      }
      if (!sub.service_sub_amount || isNaN(sub.service_sub_amount) || parseFloat(sub.service_sub_amount) < 0) {
        toast.error(`Amount must be a positive number for row #${index + 1}`);
        subErrors.push(index);
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && subErrors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      subs: subs.map((sub) => ({
        id: sub.id,
        service_sub_types: sub.service_sub_types,
        service_sub_amount: sub.service_sub_amount,
        service_sub_description: sub.service_sub_description || "",
      })),
    };

    updateMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Service details updated successfully!");
        queryClient.invalidateQueries(["services"]);
        navigate("/service");
      },
      onError: (error) => {
        console.error("Failed to update service:", error);
        toast.error(
          error.response?.data?.message || "Failed to update service log.",
        );
      },
    });
  };

  if (serviceLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-[var(--team-color)]" />
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Loading service log details...
          </p>
        </div>
      </div>
    );
  }

  if (serviceError) {
    return (
      <div className="w-full p-6 text-center">
        <div className="bg-white p-6 rounded-lg border border-slate-100 max-w-md mx-auto shadow-sm">
          <p className="text-rose-600 font-medium mb-4">
            Error loading service data.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 bg-[#f8f9fa] min-h-screen">
      {/* Navigation Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/service")}
          className="text-slate-600 hover:text-slate-900 px-2 h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Services
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex flex-row items-center gap-3">
          <div className="p-2 bg-[var(--team-color)]/10 text-[var(--team-color)] rounded-lg">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-950">
              Edit Services
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modify maintenance log parameters and sub-service billing items
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <ServiceForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
            activeVehicles={activeVehicles}
            vehiclesLoading={vehiclesLoading}
            activeVendors={activeVendors}
            vendorsLoading={vendorsLoading}
            isEditMode={true}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isLoading}
            onCancel={() => navigate("/service")}
          >
            <SubServiceTable
              subs={subs}
              onAddRow={handleAddSubRow}
              onChangeRow={handleSubChange}
              onDeleteRow={handleDeleteSubRow}
            />
          </ServiceForm>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Backend Sub-Service Deletes */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete this service sub-item
              from the database? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsConfirmOpen(false);
                setSubToDelete(null);
              }}
              className="text-xs border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteSubMutation.isLoading}
              onClick={confirmDeleteSub}
              className="text-xs"
            >
              {deleteSubMutation.isLoading ? (
                <>
                  <Loader className="mr-1 h-3 w-3 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditService;
