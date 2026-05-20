import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Search } from "lucide-react";
import { useState } from "react";

const ServiceForm = ({
  formData,
  onInputChange,
  errors = {},
  activeVehicles = [],
  vehiclesLoading = false,
  activeVendors = [],
  vendorsLoading = false,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
  onCancel,
  children, // to render SubServiceTable inside the card
}) => {
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");

  const filteredVehicles = activeVehicles.filter((v) => {
    const plate =
      v.vehicle_number_plate ||
      v.vehicle_number ||
      v.truck_no ||
      v.number_plate ||
      "";
    return plate.toLowerCase().includes(vehicleSearchTerm.toLowerCase());
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        {/* Service Date */}
        <div className="space-y-1.5">
          <Label
            htmlFor="service_date"
            className="text-xs font-semibold text-slate-700"
          >
            From Date <span className="text-rose-500">*</span>
          </Label>
          <DatePicker
            date={formData.service_date}
            setDate={(val) => onInputChange("service_date", val)}
            hasError={!!errors.service_date}
          />
          {errors.service_date && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.service_date}
            </p>
          )}
        </div>

        {/* Service To Date */}
        {isEditMode && (
          <div className="space-y-1.5">
            <Label
              htmlFor="service_to_date"
              className="text-xs font-semibold text-slate-700"
            >
              To Date <span className="text-rose-500">*</span>
            </Label>
            <DatePicker
              date={formData.service_to_date}
              setDate={(val) => onInputChange("service_to_date", val)}
              hasError={!!errors.service_to_date}
            />
            {errors.service_to_date && (
              <p className="text-[10px] text-rose-500 font-medium">
                {errors.service_to_date}
              </p>
            )}
          </div>
        )}

        {/* Vehicle Number (Searchable Popover) */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <Label className="text-xs font-semibold text-slate-700">
            Vehicle No <span className="text-rose-500">*</span>
          </Label>
          <Popover
            open={vehiclePopoverOpen}
            onOpenChange={setVehiclePopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className={`w-full h-10 px-3 text-left font-normal text-xs justify-between border-slate-200 hover:bg-white focus:ring-2 focus:ring-slate-100 ${
                  errors.service_truck_no
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                    : ""
                }`}
              >
                {formData.service_truck_no || "Select vehicle plate..."}
                <span className="text-slate-400">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              <div className="flex items-center border border-slate-100 rounded-md px-2.5 mb-2 bg-slate-50">
                <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
                <Input
                  placeholder="Search plate number..."
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  className="h-8 border-none focus:ring-0 bg-transparent text-xs p-0"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {vehiclesLoading ? (
                  <div className="p-3 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader className="h-3 w-3 animate-spin text-slate-500" />
                    Loading vehicles...
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No vehicle found.
                  </div>
                ) : (
                  filteredVehicles.map((v) => {
                    const plate =
                      v.vehicle_number_plate ||
                      v.vehicle_number ||
                      v.truck_no ||
                      v.number_plate ||
                      "";
                    const isSelected = formData.service_truck_no === plate;
                    return (
                      <button
                        key={v.id || plate}
                        type="button"
                        onClick={() => {
                          onInputChange("service_truck_no", plate);
                          setVehiclePopoverOpen(false);
                          setVehicleSearchTerm("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-50 transition-colors ${
                          isSelected
                            ? "bg-slate-100 font-semibold text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {plate}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.service_truck_no && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.service_truck_no}
            </p>
          )}
        </div>

        {/* Garage / Vendor Select Dropdown */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <Label
            htmlFor="service_vendor_id"
            className="text-xs font-semibold text-slate-700"
          >
            Garage <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={formData.service_vendor_id}
            onValueChange={(val) => onInputChange("service_vendor_id", val)}
          >
            <SelectTrigger
              id="service_vendor_id"
              className={`h-10 text-xs border-slate-200 focus:ring-slate-100 ${
                errors.service_vendor_id
                  ? "border-rose-500 focus:border-rose-500"
                  : ""
              }`}
            >
              <SelectValue
                placeholder={
                  vendorsLoading ? "Loading garages..." : "Select garage..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {activeVendors.map((vendor) => {
                const idVal = vendor.id?.toString() || "";
                const nameVal =
                  vendor.vendor_name ||
                  vendor.name ||
                  vendor.garage_name ||
                  `Garage ID: ${vendor.id}`;
                return (
                  <SelectItem key={idVal} value={idVal} className="text-xs">
                    {nameVal}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.service_vendor_id && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.service_vendor_id}
            </p>
          )}
        </div>

        {/* Bill No */}
        {isEditMode && (
          <div className="space-y-1.5">
            <Label
              htmlFor="service_bill_no"
              className="text-xs font-semibold text-slate-700"
            >
              Bill No <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="service_bill_no"
              placeholder="Enter bill number"
              value={formData.service_bill_no}
              onChange={(e) => onInputChange("service_bill_no", e.target.value)}
              className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
                errors.service_bill_no
                  ? "border-rose-500 focus:border-rose-500"
                  : ""
              }`}
            />
            {errors.service_bill_no && (
              <p className="text-[10px] text-rose-500 font-medium">
                {errors.service_bill_no}
              </p>
            )}
          </div>
        )}

        {/* Total Amount */}
        {isEditMode && (
          <div className="space-y-1.5">
            <Label
              htmlFor="service_amount"
              className="text-xs font-semibold text-slate-700"
            >
              Total Amount (₹) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="service_amount"
              type="number"
              placeholder="Calculated or manual amount"
              value={formData.service_amount}
              onChange={(e) => onInputChange("service_amount", e.target.value)}
              className={`text-xs h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 ${
                errors.service_amount
                  ? "border-rose-500 focus:border-rose-500"
                  : ""
              }`}
            />
            {errors.service_amount && (
              <p className="text-[10px] text-rose-500 font-medium">
                {errors.service_amount}
              </p>
            )}
          </div>
        )}

        {/* Status Dropdown */}
        {isEditMode && (
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label
              htmlFor="service_status"
              className="text-xs font-semibold text-slate-700"
            >
              Status <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.service_status}
              onValueChange={(val) => onInputChange("service_status", val)}
            >
              <SelectTrigger
                id="service_status"
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
                <SelectItem value="Finish" className="text-xs">
                  Finish
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Remarks */}
        <div className="space-y-1.5 md:col-span-2">
          <Label
            htmlFor="service_remarks"
            className="text-xs font-semibold text-slate-700"
          >
            Remarks
          </Label>
          <Textarea
            id="service_remarks"
            placeholder="Enter remarks..."
            value={formData.service_remarks}
            onChange={(e) => onInputChange("service_remarks", e.target.value)}
            className="text-xs min-h-[40px] h-10 border-slate-200 focus:border-slate-300 focus:ring-slate-100 rounded-lg"
          />
        </div>
      </div>

      {/* Child elements like dynamic sub-services logs table */}
      {children && <div className="pt-2">{children}</div>}

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="h-10 px-5 text-xs font-medium border-slate-200 hover:bg-slate-50 rounded-lg"
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
            "Update Service Log"
          ) : (
            "Save Service Log"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
