import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Store } from "lucide-react";

const VendorForm = ({
  formData,
  onInputChange,
  errors = {},
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white">
          <Store className="w-4 h-4" />
          Vendor Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vendor Name */}
          <div>
            <Label htmlFor="vendor_name" className="text-xs font-medium">
              Vendor Name *
            </Label>
            <Input
              id="vendor_name"
              placeholder="Enter vendor or garage name"
              value={formData.vendor_name}
              onChange={(e) => onInputChange("vendor_name", e.target.value)}
              className={errors.vendor_name ? "border-red-500" : ""}
            />
            {errors.vendor_name && (
              <p className="text-red-500 text-xs">
                {errors.vendor_name}
              </p>
            )}
          </div>

          {/* Vendor Mobile */}
          <div>
            <Label htmlFor="vendor_mobile" className="text-xs font-medium">
              Mobile Number
            </Label>
            <Input
              id="vendor_mobile"
              placeholder="Enter 10-digit mobile number"
              value={formData.vendor_mobile}
              onChange={(e) => onInputChange("vendor_mobile", e.target.value)}
              className={errors.vendor_mobile ? "border-red-500" : ""}
            />
            {errors.vendor_mobile && (
              <p className="text-red-500 text-xs">
                {errors.vendor_mobile}
              </p>
            )}
          </div>

          {/* Vendor Email */}
          <div>
            <Label htmlFor="vendor_email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="vendor_email"
              type="email"
              placeholder="Enter email address"
              value={formData.vendor_email}
              onChange={(e) => onInputChange("vendor_email", e.target.value)}
              className={errors.vendor_email ? "border-red-500" : ""}
            />
            {errors.vendor_email && (
              <p className="text-red-500 text-xs">
                {errors.vendor_email}
              </p>
            )}
          </div>

          {/* Vendor Type Dropdown */}
          <div>
            <Label htmlFor="vendor_type" className="text-xs font-medium">
              Vendor Type *
            </Label>
            <Select
              value={formData.vendor_type}
              onValueChange={(val) => onInputChange("vendor_type", val)}
            >
              <SelectTrigger
                id="vendor_type"
                className={errors.vendor_type ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select vendor type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Garage">Garage</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.vendor_type && (
              <p className="text-red-500 text-xs">
                {errors.vendor_type}
              </p>
            )}
          </div>

          {/* Vendor Status Dropdown (visible in edit mode) */}
          {isEditMode && (
            <div>
              <Label htmlFor="vendor_status" className="text-xs font-medium">
                Status *
              </Label>
              <Select
                value={formData.vendor_status}
                onValueChange={(val) => onInputChange("vendor_status", val)}
              >
                <SelectTrigger id="vendor_status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Vendor Address */}
          <div className="col-span-full">
            <Label htmlFor="vendor_address" className="text-xs font-medium">
              Address
            </Label>
            <Textarea
              id="vendor_address"
              placeholder="Enter physical address..."
              value={formData.vendor_address}
              onChange={(e) => onInputChange("vendor_address", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Store className="w-4 h-4" />
              {isEditMode ? "Update Vendor" : "Create Vendor"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
