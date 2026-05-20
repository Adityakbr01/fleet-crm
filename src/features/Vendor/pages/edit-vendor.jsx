import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetchVendor, useUpdateVendor } from "@/features/Vendor/hooks/use-vendors";
import VendorForm from "@/features/Vendor/forms/vendor-form";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader, Store } from "lucide-react";
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
    <div className="max-w-7xl mx-auto p-4 space-y-6 bg-[#f8f9fa] min-h-screen">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/vendor")}
          className="text-slate-600 hover:text-slate-900 px-2 h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Vendor Master
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex flex-row items-center gap-3">
          <div className="p-2 bg-[var(--team-color)]/10 text-[var(--team-color)] rounded-lg">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-950">
              Edit Vendor Profile
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modify vendor information and operating status
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
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
