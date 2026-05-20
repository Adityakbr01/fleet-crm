import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreateService,
  useFetchActiveVehicles,
  useFetchActiveVendors,
} from "@/features/Service/hooks/use-services";
import ServiceForm from "@/features/Service/forms/service-form";
import { ChevronLeft, Wrench } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateService = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    service_date: "",
    service_to_date: "",
    service_truck_no: "",
    service_vendor_id: "",
    service_remarks: "",
  });

  const [errors, setErrors] = useState({});

  // 1. Hooks for fetching lookup lists
  const { data: activeVehicles = [], isLoading: vehiclesLoading } =
    useFetchActiveVehicles();
  const { data: activeVendors = [], isLoading: vendorsLoading } =
    useFetchActiveVendors();

  // 2. Mutation Hook
  const createMutation = useCreateService();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.service_date)
      newErrors.service_date = "From date is required";
    if (!formData.service_truck_no)
      newErrors.service_truck_no = "Vehicle number is required";
    if (!formData.service_vendor_id)
      newErrors.service_vendor_id = "Garage/Vendor is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    const payload = {
      service_date: formData.service_date,
      service_truck_no: formData.service_truck_no,
      service_vendor_id: formData.service_vendor_id,
      service_remarks: formData.service_remarks,
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Service logged successfully!");
        navigate("/service");
      },
      onError: (error) => {
        console.error("Failed to save service:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to log service. Please check details.",
        );
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 bg-[#f8f9fa] min-h-screen">
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

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex flex-row items-center gap-3">
          <div className="p-2 bg-[var(--team-color)]/10 text-[var(--team-color)] rounded-lg">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-950">
              Create Services
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter vehicle garage maintenance and service particulars
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
            isEditMode={false}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading}
            onCancel={() => navigate("/service")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;
