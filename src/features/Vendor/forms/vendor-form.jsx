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
import { Loader } from "lucide-react";

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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Vendor Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="vendor_name"
            className="text-xs font-semibold text-slate-700"
          >
            Vendor Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="vendor_name"
            placeholder="Enter vendor or garage name"
            value={formData.vendor_name}
            onChange={(e) => onInputChange("vendor_name", e.target.value)}
            className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
              errors.vendor_name
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                : ""
            }`}
          />
          {errors.vendor_name && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.vendor_name}
            </p>
          )}
        </div>

        {/* Vendor Mobile */}
        <div className="space-y-1.5">
          <Label
            htmlFor="vendor_mobile"
            className="text-xs font-semibold text-slate-700"
          >
            Mobile Number
          </Label>
          <Input
            id="vendor_mobile"
            placeholder="Enter 10-digit mobile number"
            value={formData.vendor_mobile}
            onChange={(e) => onInputChange("vendor_mobile", e.target.value)}
            className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
              errors.vendor_mobile
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                : ""
            }`}
          />
          {errors.vendor_mobile && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.vendor_mobile}
            </p>
          )}
        </div>

        {/* Vendor Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="vendor_email"
            className="text-xs font-semibold text-slate-700"
          >
            Email Address
          </Label>
          <Input
            id="vendor_email"
            type="email"
            placeholder="Enter email address"
            value={formData.vendor_email}
            onChange={(e) => onInputChange("vendor_email", e.target.value)}
            className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
              errors.vendor_email
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                : ""
            }`}
          />
          {errors.vendor_email && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.vendor_email}
            </p>
          )}
        </div>

        {/* Vendor Type Dropdown */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <Label
            htmlFor="vendor_type"
            className="text-xs font-semibold text-slate-700"
          >
            Vendor Type <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={formData.vendor_type}
            onValueChange={(val) => onInputChange("vendor_type", val)}
          >
            <SelectTrigger
              id="vendor_type"
              className={`h-10 text-xs border-slate-200 focus:ring-slate-100 ${
                errors.vendor_type
                  ? "border-rose-500 focus:border-rose-500"
                  : ""
              }`}
            >
              <SelectValue placeholder="Select vendor type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Garage" className="text-xs">
                Garage
              </SelectItem>
              <SelectItem value="Others" className="text-xs">
                Others
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.vendor_type && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.vendor_type}
            </p>
          )}
        </div>

        {/* Vendor Status Dropdown (visible in edit mode) */}
        {isEditMode && (
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label
              htmlFor="vendor_status"
              className="text-xs font-semibold text-slate-700"
            >
              Status <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.vendor_status}
              onValueChange={(val) => onInputChange("vendor_status", val)}
            >
              <SelectTrigger
                id="vendor_status"
                className="h-10 text-xs border-slate-200 focus:ring-slate-100"
              >
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="Inactive" className="text-xs">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Vendor Address */}
        <div className="space-y-1.5 md:col-span-2">
          <Label
            htmlFor="vendor_address"
            className="text-xs font-semibold text-slate-700"
          >
            Address
          </Label>
          <Textarea
            id="vendor_address"
            placeholder="Enter physical address..."
            value={formData.vendor_address}
            onChange={(e) => onInputChange("vendor_address", e.target.value)}
            className="text-xs min-h-[60px] border-slate-200 focus:border-slate-300 focus:ring-slate-100 rounded-lg"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="h-10 px-5 text-xs font-medium border-slate-200 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-6 text-xs font-semibold bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white rounded-lg shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : isEditMode ? (
            "Update Vendor"
          ) : (
            "Save Vendor"
          )}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
