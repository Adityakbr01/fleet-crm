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
import { Loader, Search, Wrench } from "lucide-react";
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
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center p-1 gap-2 text-sm rounded-md px-1 font-medium bg-[var(--team-color)] text-white">
          <Wrench className="w-4 h-4" />
          Service Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Service Date */}
          <div>
            <Label htmlFor="service_date" className="text-xs font-medium">
              From Date *
            </Label>
            <DatePicker
              date={formData.service_date}
              setDate={(val) => onInputChange("service_date", val)}
              hasError={!!errors.service_date}
            />
            {errors.service_date && (
              <p className="text-red-500 text-xs">
                {errors.service_date}
              </p>
            )}
          </div>

          {/* Service To Date */}
          {isEditMode && (
            <div>
              <Label htmlFor="service_to_date" className="text-xs font-medium">
                To Date *
              </Label>
              <DatePicker
                date={formData.service_to_date}
                setDate={(val) => onInputChange("service_to_date", val)}
                hasError={!!errors.service_to_date}
              />
              {errors.service_to_date && (
                <p className="text-red-500 text-xs">
                  {errors.service_to_date}
                </p>
              )}
            </div>
          )}

          {/* Vehicle Number (Searchable Popover) */}
          <div>
            <Label className="text-xs font-medium">
              Vehicle No *
            </Label>
            <Popover
              open={vehiclePopoverOpen}
              onOpenChange={setVehiclePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={`w-full text-left font-normal justify-between ${
                    errors.service_truck_no ? "border-red-500" : ""
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
              <p className="text-red-500 text-xs">
                {errors.service_truck_no}
              </p>
            )}
          </div>

          {/* Garage / Vendor Select Dropdown */}
          <div>
            <Label htmlFor="service_vendor_id" className="text-xs font-medium">
              Garage *
            </Label>
            <Select
              value={formData.service_vendor_id}
              onValueChange={(val) => onInputChange("service_vendor_id", val)}
            >
              <SelectTrigger
                id="service_vendor_id"
                className={errors.service_vendor_id ? "border-red-500" : ""}
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
                    <SelectItem key={idVal} value={idVal}>
                      {nameVal}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.service_vendor_id && (
              <p className="text-red-500 text-xs">
                {errors.service_vendor_id}
              </p>
            )}
          </div>

          {/* Bill No */}
          {isEditMode && (
            <div>
              <Label htmlFor="service_bill_no" className="text-xs font-medium">
                Bill No *
              </Label>
              <Input
                id="service_bill_no"
                placeholder="Enter bill number"
                value={formData.service_bill_no}
                onChange={(e) => onInputChange("service_bill_no", e.target.value)}
                className={errors.service_bill_no ? "border-red-500" : ""}
              />
              {errors.service_bill_no && (
                <p className="text-red-500 text-xs">
                  {errors.service_bill_no}
                </p>
              )}
            </div>
          )}

          {/* Total Amount */}
          {isEditMode && (
            <div>
              <Label htmlFor="service_amount" className="text-xs font-medium">
                Total Amount (₹) *
              </Label>
              <Input
                id="service_amount"
                type="number"
                placeholder="Calculated or manual amount"
                value={formData.service_amount}
                onChange={(e) => onInputChange("service_amount", e.target.value)}
                className={errors.service_amount ? "border-red-500" : ""}
              />
              {errors.service_amount && (
                <p className="text-red-500 text-xs">
                  {errors.service_amount}
                </p>
              )}
            </div>
          )}

          {/* Status Dropdown */}
          {isEditMode && (
            <div>
              <Label htmlFor="service_status" className="text-xs font-medium">
                Status *
              </Label>
              <Select
                value={formData.service_status}
                onValueChange={(val) => onInputChange("service_status", val)}
              >
                <SelectTrigger id="service_status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Finish">Finish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Remarks */}
          <div className="col-span-full">
            <Label htmlFor="service_remarks" className="text-xs font-medium">
              Remarks
            </Label>
            <Textarea
              id="service_remarks"
              placeholder="Enter remarks..."
              value={formData.service_remarks}
              onChange={(e) => onInputChange("service_remarks", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Child elements like dynamic sub-services logs table */}
      {children && <div className="pt-2">{children}</div>}

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
              <Wrench className="w-4 h-4" />
              {isEditMode ? "Update Service" : "Create Service"}
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

export default ServiceForm;
