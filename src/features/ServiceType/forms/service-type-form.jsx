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
import { Loader, Settings2 } from "lucide-react";

const ServiceTypeForm = ({
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
          <Settings2 className="w-4 h-4" />
          Service Type Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Type Name */}
          <div>
            <Label htmlFor="service_types" className="text-xs font-medium">
              Service Type Name *
            </Label>
            <Input
              id="service_types"
              placeholder="e.g. ENGINE OIL CHANGE"
              value={formData.service_types}
              onChange={(e) => onInputChange("service_types", e.target.value)}
              className={errors.service_types ? "border-red-500" : ""}
            />
            {errors.service_types && (
              <p className="text-red-500 text-xs">
                {errors.service_types}
              </p>
            )}
          </div>

          {/* Status Dropdown (visible in edit mode) */}
          {isEditMode && (
            <div>
              <Label htmlFor="service_types_status" className="text-xs font-medium">
                Status *
              </Label>
              <Select
                value={formData.service_types_status}
                onValueChange={(val) => onInputChange("service_types_status", val)}
              >
                <SelectTrigger id="service_types_status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
              <Settings2 className="w-4 h-4" />
              {isEditMode ? "Update Service Type" : "Create Service Type"}
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

export default ServiceTypeForm;

