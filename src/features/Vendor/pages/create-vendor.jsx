import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateVendor } from "@/features/Vendor/hooks/use-vendors";
import VendorForm from "@/features/Vendor/forms/vendor-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateVendor = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_mobile: "",
    vendor_email: "",
    vendor_address: "",
    vendor_type: "Garage",
  });

  const [errors, setErrors] = useState({});

  // Mutation for creating vendor
  const createMutation = useCreateVendor();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate form parameters
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

    if (
      formData.vendor_mobile &&
      !/^\d{10}$/.test(formData.vendor_mobile.trim())
    ) {
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
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Vendor created successfully!");
        queryClient.invalidateQueries(["vendors"]);
        navigate("/vendor");
      },
      onError: (error) => {
        console.error("Failed to create vendor:", error);
        toast.error(
          error.response?.data?.message || "Failed to create vendor profile.",
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
              <Store className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">
                    Create Vendor Profile
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Add a new garage, parts supplier, or service partner
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
            isEditMode={false}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading}
            onCancel={() => navigate("/vendor")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVendor;
