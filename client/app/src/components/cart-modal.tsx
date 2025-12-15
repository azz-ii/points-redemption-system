import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Trash2, X, Search } from "lucide-react";
import { distributorsApi, type Distributor } from "@/lib/distributors-api";
import { redemptionRequestsApi, type CreateRedemptionRequestData } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  points: number;
  image: string;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  availablePoints: number;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  availablePoints,
}: CartModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [customerName, setCustomerName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [svcDate, setSvcDate] = useState<string>("");
  const [svcTime, setSvcTime] = useState<string>("");
  const [svcDriver, setSvcDriver] = useState<string>("");
  
  // Distributor search state
  const [distributorSearch, setDistributorSearch] = useState("");
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Points deduction and submission state
  const [pointsDeductedFrom, setPointsDeductedFrom] = useState<'SELF' | 'DISTRIBUTOR'>('SELF');
  const [submitting, setSubmitting] = useState(false);

  // Search distributors with debounce
  useEffect(() => {
    if (distributorSearch.length < 2) {
      setDistributors([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoadingDistributors(true);
        const results = await distributorsApi.getDistributors(distributorSearch);
        setDistributors(results);
      } catch (error) {
        console.error("Error searching distributors:", error);
        setDistributors([]);
      } finally {
        setLoadingDistributors(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [distributorSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDistributorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const totalPoints = items.reduce(
    (sum, item) => sum + item.points * item.quantity,
    0
  );
  const remainingPoints = availablePoints - totalPoints;

  const handleSelectDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setCustomerName(distributor.name);
    setDistributorSearch(distributor.name);
    setShowDistributorDropdown(false);
  };

  const handleDistributorSearchChange = (value: string) => {
    setDistributorSearch(value);
    setCustomerName(value);
    setSelectedDistributor(null);
    setShowDistributorDropdown(true);
  };

  const handleSubmit = async () => {
    if (!selectedDistributor) {
      toast.error("Please select a distributor");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData: CreateRedemptionRequestData = {
        requested_for: selectedDistributor.id,
        points_deducted_from: pointsDeductedFrom,
        remarks: remarks || undefined,
        items: items.map(item => ({
          variant_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await redemptionRequestsApi.createRequest(requestData);
      
      toast.success("Redemption request submitted!", {
        description: `Request #${response.id} has been created successfully`
      });
      
      // Clear cart and close modal
      items.forEach(item => onRemoveItem(item.id));
      setStep("cart");
      setCustomerName("");
      setRemarks("");
      setDistributorSearch("");
      setSelectedDistributor(null);
      setSvcDate("");
      setSvcTime("");
      setSvcDriver("");
      setPointsDeductedFrom('SELF');
      onClose();
      
    } catch (error) {
      console.error("Error submitting redemption request:", error);
      toast.error("Failed to submit request", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Desktop Modal */}
      <div
        className={`relative hidden md:flex flex-col mx-4 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {step === "cart" ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 md:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Confirm your Redemption Items
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Please review the items and quantities below before confirming
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items Table */}
            <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
              {items.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${
                        isDark ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      <th
                        className={`text-left py-3 px-4 text-sm font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Item
                      </th>
                      <th
                        className={`text-center py-3 px-4 text-sm font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Quantity
                      </th>
                      <th
                        className={`text-right py-3 px-4 text-sm font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Points
                      </th>
                      <th
                        className={`text-right py-3 px-4 text-sm font-semibold ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b ${
                          isDark ? "border-gray-800" : "border-gray-200"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className={`px-2 py-1 rounded ${
                                isDark
                                  ? "bg-gray-800 hover:bg-gray-700"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              −
                            </button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className={`px-2 py-1 rounded ${
                                isDark
                                  ? "bg-gray-800 hover:bg-gray-700"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {(item.points * item.quantity).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  className={`text-center py-8 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No items in cart
                </p>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div
                className={`px-6 py-4 border-t ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Your current points:
                    </span>
                    <span className="font-semibold">
                      {availablePoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Total points for this request:
                    </span>
                    <span className="font-semibold text-red-500">
                      -{totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between pt-2 border-t ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Balance:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        remainingPoints >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {remainingPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 md:border-gray-800">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("details")}
                disabled={items.length === 0 || remainingPoints < 0}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                  items.length === 0 || remainingPoints < 0
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header - Redemption Details */}
            <div className="p-6 border-b border-gray-200 md:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Redemption Details</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Fill up the needed details below to complete your redemption
                  request
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Forms */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Customer Details */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Customer/Distributor Details</h3>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-1 relative" ref={dropdownRef}>
                      <label
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Customer/Distributor Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={distributorSearch}
                          onChange={(e) => handleDistributorSearchChange(e.target.value)}
                          onFocus={() => setShowDistributorDropdown(true)}
                          placeholder="Search for a distributor..."
                          className={`w-full px-3 py-2 pr-10 rounded-md outline-none ${
                            isDark
                              ? "bg-gray-800 border border-gray-700"
                              : "bg-gray-100 border border-gray-200"
                          }`}
                        />
                        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`} />
                      </div>
                      
                      {/* Dropdown */}
                      {showDistributorDropdown && distributorSearch.length >= 2 && (
                        <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-60 overflow-y-auto ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}>
                          {loadingDistributors ? (
                            <div className="px-3 py-2 text-sm text-center">
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                Searching...
                              </span>
                            </div>
                          ) : distributors.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-center">
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                No distributors found
                              </span>
                            </div>
                          ) : (
                            distributors.map((distributor) => (
                              <button
                                key={distributor.id}
                                onClick={() => handleSelectDistributor(distributor)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-opacity-10 ${
                                  isDark
                                    ? "hover:bg-white"
                                    : "hover:bg-gray-900"
                                } border-b last:border-b-0 ${
                                  isDark ? "border-gray-700" : "border-gray-200"
                                }`}
                              >
                                <div className="font-medium">{distributor.name}</div>
                                <div className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-600"
                                }`}>
                                  {distributor.location} • {distributor.region}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      
                      {selectedDistributor && (
                        <div className={`text-xs mt-1 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}>
                          ✓ Selected: {selectedDistributor.name} ({selectedDistributor.location})
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Purpose/Remarks
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter Purpose or Remarks"
                        rows={4}
                        className={`w-full px-3 py-2 rounded-md outline-none resize-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Deduction */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Points Deduction</h3>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction"
                        value="SELF"
                        checked={pointsDeductedFrom === 'SELF'}
                        onChange={() => setPointsDeductedFrom('SELF')}
                        className="w-4 h-4"
                      />
                      <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Deduct from my points
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction"
                        value="DISTRIBUTOR"
                        checked={pointsDeductedFrom === 'DISTRIBUTOR'}
                        onChange={() => setPointsDeductedFrom('DISTRIBUTOR')}
                        className="w-4 h-4"
                      />
                      <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Deduct from distributor's points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-semibold">
                      Service Vehicle Use
                    </h3>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      (If applicable)
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Purpose/Remarks
                      </label>
                      <input
                        type="date"
                        value={svcDate}
                        onChange={(e) => setSvcDate(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className={`w-full px-3 py-2 rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        value={svcTime}
                        onChange={(e) => setSvcTime(e.target.value)}
                        className={`w-full px-3 py-2 rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Driver
                      </label>
                      <select
                        value={svcDriver}
                        onChange={(e) => setSvcDriver(e.target.value)}
                        className={`w-full px-3 py-2 rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <option value="with">With Driver</option>
                        <option value="without">Without Driver</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 md:border-gray-800">
              <button
                onClick={() => setStep("cart")}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Details"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Modal */}
      <div
        className={`relative md:hidden mx-4 w-full max-w-md max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {step === "cart" ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 md:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Confirm your Redemption</h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Please review the items and quantities below before confirming
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-80">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-xs text-green-500 font-semibold">
                          {item.points.toLocaleString()} pts
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  className={`text-center py-8 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No items in cart
                </p>
              )}
            </div>
            {/* Summary */}
            {items.length > 0 && (
              <div
                className={`px-4 py-3 border-t space-y-2 text-xs ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Current points:
                  </span>
                  <span className="font-semibold">
                    {availablePoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Total request:
                  </span>
                  <span className="font-semibold text-red-500">
                    -{totalPoints.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-2 border-t ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Balance:
                  </span>
                  <span
                    className={`font-bold ${
                      remainingPoints >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {remainingPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Header - Redemption Details */}
            <div className="p-4 border-b border-gray-200 md:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Redemption Details</h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Fill up the needed details
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Forms */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 pb-20">
              {/* Customer Details */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-3">
                  <h3 className="text-sm font-semibold">Customer/Distributor Details</h3>
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1 relative">
                      <label
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Customer/Distributor Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={distributorSearch}
                          onChange={(e) => handleDistributorSearchChange(e.target.value)}
                          onFocus={() => setShowDistributorDropdown(true)}
                          placeholder="Search for a distributor..."
                          className={`w-full px-3 py-2 pr-10 text-sm rounded-md outline-none ${
                            isDark
                              ? "bg-gray-800 border border-gray-700"
                              : "bg-gray-100 border border-gray-200"
                          }`}
                        />
                        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`} />
                      </div>
                      
                      {/* Dropdown */}
                      {showDistributorDropdown && distributorSearch.length >= 2 && (
                        <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}>
                          {loadingDistributors ? (
                            <div className="px-3 py-2 text-xs text-center">
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                Searching...
                              </span>
                            </div>
                          ) : distributors.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-center">
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                No distributors found
                              </span>
                            </div>
                          ) : (
                            distributors.map((distributor) => (
                              <button
                                key={distributor.id}
                                onClick={() => handleSelectDistributor(distributor)}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-opacity-10 ${
                                  isDark
                                    ? "hover:bg-white"
                                    : "hover:bg-gray-900"
                                } border-b last:border-b-0 ${
                                  isDark ? "border-gray-700" : "border-gray-200"
                                }`}
                              >
                                <div className="font-medium">{distributor.name}</div>
                                <div className={`text-xs mt-0.5 ${
                                  isDark ? "text-gray-400" : "text-gray-600"
                                }`}>
                                  {distributor.location} • {distributor.region}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      
                      {selectedDistributor && (
                        <div className={`text-xs mt-1 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}>
                          ✓ {selectedDistributor.name}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Purpose/Remarks
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter Purpose or Remarks"
                        rows={3}
                        className={`w-full px-3 py-2 text-sm rounded-md outline-none resize-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Deduction */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-3">
                  <h3 className="text-sm font-semibold">Points Deduction</h3>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction_mobile"
                        value="SELF"
                        checked={pointsDeductedFrom === 'SELF'}
                        onChange={() => setPointsDeductedFrom('SELF')}
                        className="w-4 h-4"
                      />
                      <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Deduct from my points
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction_mobile"
                        value="DISTRIBUTOR"
                        checked={pointsDeductedFrom === 'DISTRIBUTOR'}
                        onChange={() => setPointsDeductedFrom('DISTRIBUTOR')}
                        className="w-4 h-4"
                      />
                      <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Deduct from distributor's points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-3">
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-sm font-semibold">
                      Service Vehicle Use
                    </h3>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      (If applicable)
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1">
                      <label
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        value={svcDate}
                        onChange={(e) => setSvcDate(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        value={svcTime}
                        onChange={(e) => setSvcTime(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Driver
                      </label>
                      <select
                        value={svcDriver}
                        onChange={(e) => setSvcDriver(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-md outline-none ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <option value="">With/Without Driver</option>
                        <option value="with">With Driver</option>
                        <option value="without">Without Driver</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {step === "cart" ? (
          <div className="flex flex-col gap-2 p-4 border-t border-gray-200 md:border-gray-800">
            <button
              onClick={() => setStep("details")}
              disabled={items.length === 0 || remainingPoints < 0}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white ${
                items.length === 0 || remainingPoints < 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Next
            </button>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-semibold ${
                isDark
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              Back to Redeem
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 border-t border-gray-200 md:border-gray-800">
            <button
              onClick={() => setStep("cart")}
              className={`w-full px-4 py-3 rounded-lg font-semibold ${
                isDark
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              Back
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Details"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
