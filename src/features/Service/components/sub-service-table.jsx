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
import { Plus, Trash2 } from "lucide-react";

const COMMON_SERVICE_TYPES = [
  "ENGINE OIL CHANGE",
  "CLUTCH PLATE",
  "FLY WHEEL",
  "CLUTCH WITHDRAWAL PLATE",
  "BRAKE PAD REPLACE",
  "TYRE ALIGNMENT",
  "COOLANT TOPUP",
  "AIR FILTER REPLACE",
  "GEARBOX REPAIR",
  "ELECTRICAL WORK",
  "OTHER",
];

const SubServiceTable = ({ subs = [], onAddRow, onChangeRow, onDeleteRow }) => {
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
                Service Type *
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
                        {COMMON_SERVICE_TYPES.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-xs"
                          >
                            {type}
                          </SelectItem>
                        ))}
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
    </div>
  );
};

export default SubServiceTable;
