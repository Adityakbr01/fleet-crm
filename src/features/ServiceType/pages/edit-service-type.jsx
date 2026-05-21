import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchServiceType, useUpdateServiceType } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeForm from "@/features/ServiceType/forms/service-type-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Settings2, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditServiceType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_types: "",
    service_types_status: "Active",
  });

  const [errors, setErrors] = useState({});

  const { data: serviceTypePayload, isLoading: isFetching } = useFetchServiceType(id);
  const updateMutation = useUpdateServiceType(id);

  useEffect(() => {
    if (serviceTypePayload?.data) {
      const st = serviceTypePayload.data;
      setFormData({
        service_types: st.service_types || "",
        service_types_status: st.service_types_status || "Active",
      });
    }
  }, [serviceTypePayload]);

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
      service_types_status: formData.service_types_status,
    };

    updateMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Service Type updated successfully!");
        queryClient.invalidateQueries(["service-types"]);
        queryClient.invalidateQueries(["service-type-detail", id]);
        navigate("/service-types");
      },
      onError: (error) => {
        console.error("Failed to update service type:", error);
        toast.error(
          error.response?.data?.message || "Failed to update service type.",
        );
      },
    });
  };

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading service type details...</p>
        </div>
      </div>
    );
  }

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
                    Edit Service Type
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Modify existing service type
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
            isEditMode={true}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending || updateMutation.isLoading}
            onCancel={() => navigate("/service-types")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditServiceType;
