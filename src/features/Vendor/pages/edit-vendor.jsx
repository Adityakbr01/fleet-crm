import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchVendor, useUpdateVendor } from "@/features/Vendor/hooks/use-vendors";
import VendorForm from "@/features/Vendor/forms/vendor-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_mobile: "",
    vendor_email: "",
    vendor_address: "",
    vendor_type: "Garage",
    vendor_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // 1. Fetch Vendor Details
  const {
    data: vendorPayload,
    isLoading: vendorLoading,
    isError: vendorError,
    refetch,
  } = useFetchVendor(id);
  const vendorData = vendorPayload?.data || vendorPayload;

  // Bind initial data when payload resolves
  useEffect(() => {
    if (vendorData) {
      setFormData({
        vendor_name: vendorData.vendor_name || "",
        vendor_mobile: vendorData.vendor_mobile || "",
        vendor_email: vendorData.vendor_email || "",
        vendor_address: vendorData.vendor_address || "",
        vendor_type: vendorData.vendor_type || "Garage",
        vendor_status: vendorData.vendor_status || "Active",
      });
    }
  }, [vendorData]);

  // 2. Update Mutation
  const updateMutation = useUpdateVendor(id);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validations
  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = "Vendor name is required";
    }
    
    if (!formData.vendor_type) {
      newErrors.vendor_type = "Vendor type is required";
    }

    if (formData.vendor_email && !/\S+@\S+\.\S+/.test(formData.vendor_email)) {
      newErrors.vendor_email = "Please enter a valid email address";
    }

    if (formData.vendor_mobile && !/^\d{10}$/.test(formData.vendor_mobile.trim())) {
      newErrors.vendor_mobile = "Please enter a valid 10-digit mobile number";
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
      vendor_name: formData.vendor_name.trim(),
      vendor_mobile: formData.vendor_mobile.trim(),
      vendor_email: formData.vendor_email.trim(),
      vendor_address: formData.vendor_address.trim(),
      vendor_type: formData.vendor_type,
      vendor_status: formData.vendor_status,
    };

    updateMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Vendor details updated successfully!");
        queryClient.invalidateQueries(["vendors"]);
        navigate("/vendor");
      },
      onError: (error) => {
        console.error("Failed to update vendor:", error);
        toast.error(
          error.response?.data?.message || "Failed to update vendor profile."
        );
      },
    });
  };

  if (vendorLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-[var(--team-color)]" />
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Loading vendor details...
          </p>
        </div>
      </div>
    );
  }

  if (vendorError) {
    return (
      <div className="w-full p-6 text-center">
        <div className="bg-white p-6 rounded-lg border border-slate-100 max-w-md mx-auto shadow-sm">
          <p className="text-rose-600 font-medium mb-4">
            Error loading vendor data.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
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
              <Store className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Edit Vendor Profile
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Modify vendor information and operating status
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/vendor")}
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
          <VendorForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
            isEditMode={true}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isLoading}
            onCancel={() => navigate("/vendor")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVendor;
