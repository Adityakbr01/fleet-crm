import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateServiceType } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeForm from "@/features/ServiceType/forms/service-type-form";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Settings2 } from "lucide-react";
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
    <div className="max-w-7xl mx-auto p-4 space-y-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/service-types")}
          className="text-slate-600 hover:text-slate-900 px-2 h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Service Types
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex flex-row items-center gap-3">
          <div className="p-2 bg-[var(--team-color)]/10 text-[var(--team-color)] rounded-lg">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-950">
              Create Service Type
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a new service type definition
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
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
