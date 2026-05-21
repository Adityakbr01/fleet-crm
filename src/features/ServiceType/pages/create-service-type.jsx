import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateServiceType } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeForm from "@/features/ServiceType/forms/service-type-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Settings2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateServiceType = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_types: "",
  });

  const [errors, setErrors] = useState({});

  const createMutation = useCreateServiceType();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.service_types.trim()) {
      newErrors.service_types = "Service type name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.");
      return;
    }

    const payload = {
      service_types: formData.service_types.trim(),
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Service Type created successfully!");
        queryClient.invalidateQueries(["service-types"]);
        navigate("/service-types");
      },
      onError: (error) => {
        console.error("Failed to create service type:", error);
        toast.error(
          error.response?.data?.message || "Failed to create service type.",
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
              <Settings2 className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Create Service Type
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Add a new service type definition
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/service-types")}
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
          <ServiceTypeForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
            isEditMode={false}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || createMutation.isLoading}
            onCancel={() => navigate("/service-types")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateServiceType;
