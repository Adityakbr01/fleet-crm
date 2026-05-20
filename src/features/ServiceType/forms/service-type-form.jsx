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
import { Loader } from "lucide-react";

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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Service Type Name */}
        <div className="space-y-1.5 md:col-span-2">
          <Label
            htmlFor="service_types"
            className="text-xs font-semibold text-slate-700"
          >
            Service Type Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="service_types"
            placeholder="e.g. ENGINE OIL CHANGE"
            value={formData.service_types}
            onChange={(e) => onInputChange("service_types", e.target.value)}
            className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
              errors.service_types
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                : ""
            }`}
          />
          {errors.service_types && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.service_types}
            </p>
          )}
        </div>

        {/* Status Dropdown (visible in edit mode) */}
        {isEditMode && (
          <div className="space-y-1.5 md:col-span-2 flex flex-col justify-end">
            <Label
              htmlFor="service_types_status"
              className="text-xs font-semibold text-slate-700"
            >
              Status <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.service_types_status}
              onValueChange={(val) => onInputChange("service_types_status", val)}
            >
              <SelectTrigger
                id="service_types_status"
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
            "Update Service Type"
          ) : (
            "Save Service Type"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceTypeForm;
