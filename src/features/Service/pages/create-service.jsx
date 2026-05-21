import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateService,
  useFetchActiveVehicles,
  useFetchActiveVendors,
} from "@/features/Service/hooks/use-services";
import ServiceForm from "@/features/Service/forms/service-form";
import { ArrowLeft, Wrench } from "lucide-react";
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
    <div className="w-full space-y-1 p-4">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Wrench className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Create Services
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter vehicle garage maintenance and service particulars
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/service")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4">
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
