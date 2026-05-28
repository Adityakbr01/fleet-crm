import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFetchActiveServiceTypes,
  useCreateServiceType,
} from "@/features/ServiceType/hooks/use-service-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const SubServiceTable = ({ subs = [], onAddRow, onChangeRow, onDeleteRow }) => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newServiceTypeName, setNewServiceTypeName] = useState("");

  const { data: activeServiceTypesPayload = [], isLoading: serviceTypesLoading } =
    useFetchActiveServiceTypes();
  const activeServiceTypes =
    activeServiceTypesPayload?.data || activeServiceTypesPayload || [];

  const createMutation = useCreateServiceType();

  const handleCreateServiceType = (e) => {
    e.preventDefault();
    if (!newServiceTypeName.trim()) {
      toast.error("Service Type name is required");
      return;
    }

    createMutation.mutate(
      { service_types: newServiceTypeName.trim() },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Service Type created successfully!");
          queryClient.invalidateQueries(["activeServiceTypes"]);
          queryClient.invalidateQueries(["service-types"]);
          setIsCreateModalOpen(false);
          setNewServiceTypeName("");
        },
        onError: (error) => {
          console.error("Failed to create service type:", error);
          toast.error(
            error.response?.data?.message || "Failed to create service type."
          );
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Service Items & Sub-bills
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Break down individual repairs, spare parts and items billed under
            this service visit
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="h-8 text-xs font-semibold border-slate-200"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add More
        </Button>
      </div>

      <div className="rounded-lg border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 h-9">
              <TableHead className="text-xs font-semibold text-slate-500 py-1.5">
                <div className="flex items-center gap-2">
                  <span>Service Type *</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-6 px-1.5 py-0 text-[10px] font-semibold flex items-center gap-1 border-slate-200"
                    title="Create Service Type"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    Create Service Type
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 w-32 py-1.5">
                Amount *
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 py-1.5">
                Description
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 w-12 text-center py-1.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {subs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-16 text-center text-xs text-slate-400 italic"
                >
                  No service items added yet. Click "+ Add More" to log specific
                  repairs.
                </TableCell>
              </TableRow>
            ) : (
              subs.map((sub, index) => (
                <TableRow
                  key={index}
                  className="border-b border-slate-100 hover:bg-transparent h-12"
                >
                  {/* Service Type Select */}
                  <TableCell className="p-2">
                    <Select
                      value={sub.service_sub_types}
                      onValueChange={(val) =>
                        onChangeRow(index, "service_sub_types", val)
                      }
                    >
                      <SelectTrigger className="h-8.5 text-xs border-slate-100 focus:ring-0 bg-slate-50/50">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypesLoading ? (
                          <SelectItem value="LOADING" disabled className="text-xs">
                            Loading types...
                          </SelectItem>
                        ) : activeServiceTypes.length === 0 ? (
                          <SelectItem value="EMPTY" disabled className="text-xs">
                            No service types found
                          </SelectItem>
                        ) : (
                          activeServiceTypes.map((typeObj) => {
                            const val = typeObj.service_types || "";
                            return (
                              <SelectItem
                                key={typeObj.id || val}
                                value={val}
                                className="text-xs"
                              >
                                {val}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Sub Amount */}
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={sub.service_sub_amount}
                      onChange={(e) =>
                        onChangeRow(index, "service_sub_amount", e.target.value)
                      }
                      className="h-8.5 text-xs font-mono border-slate-100 focus:ring-0 bg-slate-50/50"
                      placeholder="Amount"
                    />
                  </TableCell>

                  {/* Sub Description */}
                  <TableCell className="p-2">
                    <Input
                      type="text"
                      value={sub.service_sub_description}
                      onChange={(e) =>
                        onChangeRow(
                          index,
                          "service_sub_description",
                          e.target.value,
                        )
                      }
                      className="h-8.5 text-xs border-slate-100 focus:ring-0 bg-slate-50/50"
                      placeholder="Describe work done..."
                    />
                  </TableCell>

                  {/* Delete Action */}
                  <TableCell className="p-2 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRow(index)}
                      disabled={subs.length <= 1}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Service Type Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Service Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateServiceType} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="new_service_type">Service Type Name *</Label>
              <Input
                id="new_service_type"
                placeholder="e.g. GEARBOX OIL CHANGE"
                value={newServiceTypeName}
                onChange={(e) => setNewServiceTypeName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewServiceTypeName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || createMutation.isLoading}
                className="bg-[var(--team-color)] hover:bg-[var(--team-color)]/90 text-white"
              >
                {createMutation.isPending || createMutation.isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Service Type"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubServiceTable;
