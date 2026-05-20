import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetchServiceType, useUpdateServiceType } from "@/features/ServiceType/hooks/use-service-types";
import ServiceTypeForm from "@/features/ServiceType/forms/service-type-form";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Settings2, Loader } from "lucide-react";
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
              Edit Service Type
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modify existing service type
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
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
