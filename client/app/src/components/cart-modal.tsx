import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Trash2, X, Search, Info } from "lucide-react";
import { distributorsApi, type Distributor } from "@/lib/distributors-api";
import { customersApi, type Customer } from "@/lib/customers-api";
import { redemptionRequestsApi, type CreateRedemptionRequestData, type PricingType, type RequestedForType, DYNAMIC_QUANTITY_LABELS, PRICING_TYPE_DESCRIPTIONS, PRICING_TYPE_INPUT_HINTS } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  points: number; // For FIXED: per-unit points. For dynamic: points_multiplier
  image: string;
  quantity: number; // For FIXED pricing items
  needs_driver: boolean;
  pricing_type: PricingType;
  points_multiplier: number | null; // For dynamic items
  dynamic_quantity?: number; // For dynamic items (sqft, invoice amount, etc.)
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDynamicQuantity: (itemId: string, dynamicQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  availablePoints: number;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateDynamicQuantity,
  onRemoveItem,
  availablePoints,
}: CartModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [remarks, setRemarks] = useState("");
  const [svcDate, setSvcDate] = useState<string>("");
  const [svcTime, setSvcTime] = useState<string>("");
  const [svcDriver, setSvcDriver] = useState<string>("");
  
  // Entity type selection (Distributor or Customer)
  const [entityType, setEntityType] = useState<RequestedForType>('DISTRIBUTOR');
  
  // Distributor search state
  const [distributorSearch, setDistributorSearch] = useState("");
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  
  // Customer search state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Points deduction and submission state
  const [pointsDeductedFrom, setPointsDeductedFrom] = useState<'SELF' | 'DISTRIBUTOR' | 'CUSTOMER'>('SELF');
  
  // Validation state for dynamic inputs
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const [showTooltips, setShowTooltips] = useState<Record<string, boolean>>({});

  // Search distributors with debounce
  useEffect(() => {
    if (entityType !== 'DISTRIBUTOR' || distributorSearch.length < 2) {
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
        // Ensure results is always an array
        setDistributors(Array.isArray(results) ? results : []);
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
  }, [distributorSearch, entityType]);

  // Search customers with debounce
  useEffect(() => {
    if (entityType !== 'CUSTOMER' || customerSearch.length < 2) {
      setCustomers([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const results = await customersApi.getCustomers(customerSearch);
        // Ensure results is always an array
        setCustomers(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Error searching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [customerSearch, entityType]);

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

  // Validate dynamic quantity input
  const validateDynamicQuantity = (value: number, pricingType: PricingType): string => {
    if (value < 0) return 'Value cannot be negative';
    if (isNaN(value)) return 'Please enter a valid number';
    
    // Type-specific validations
    if (pricingType === 'PER_INVOICE' || pricingType === 'PER_EU_SRP') {
      if (value > 999999.99) return 'Amount too large';
      // Check for reasonable decimal places (max 2)
      const decimals = value.toString().split('.')[1];
      if (decimals && decimals.length > 2) return 'Max 2 decimal places';
    } else if (pricingType === 'PER_SQFT') {
      if (value > 999999) return 'Area too large';
    } else if (pricingType === 'PER_DAY') {
      if (value > 365) return 'Max 365 days';
      if (value % 1 !== 0) return 'Must be whole days';
    }
    
    return '';
  };
  
  // Calculate points for each item based on pricing type
  const getItemPoints = (item: CartItem): number => {
    if (item.pricing_type === 'FIXED') {
      return item.points * item.quantity;
    } else {
      // Dynamic pricing: dynamic_quantity × points_multiplier
      const multiplier = item.points_multiplier || item.points;
      return (item.dynamic_quantity || 0) * multiplier;
    }
  };

  const totalPoints = items.reduce(
    (sum, item) => sum + getItemPoints(item),
    0
  );
  const remainingPoints = availablePoints - totalPoints;
  const hasItemsNeedingDriver = items.some(item => item.needs_driver);

  const handleSelectDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setDistributorSearch(distributor.name);
    setShowDistributorDropdown(false);
  };

  const handleDistributorSearchChange = (value: string) => {
    setDistributorSearch(value);
    setSelectedDistributor(null);
    setShowDistributorDropdown(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearch(value);
    setSelectedCustomer(null);
    setShowCustomerDropdown(true);
  };

  const handleEntityTypeChange = (type: RequestedForType) => {
    setEntityType(type);
    // Reset selections when switching type
    setSelectedDistributor(null);
    setSelectedCustomer(null);
    setDistributorSearch("");
    setCustomerSearch("");
    // Reset points deduction to SELF when switching entity type
    setPointsDeductedFrom('SELF');
  };

  const handleSubmit = async () => {
    // Validate entity selection based on type
    if (entityType === 'DISTRIBUTOR' && !selectedDistributor) {
      toast.error("Please select a distributor");
      return;
    }
    if (entityType === 'CUSTOMER' && !selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Prepare request data using the correct API structure
    const requestData: CreateRedemptionRequestData = {
      requested_for_type: entityType,
      ...(entityType === 'DISTRIBUTOR' && selectedDistributor 
        ? { requested_for: selectedDistributor.id }
        : {}),
      ...(entityType === 'CUSTOMER' && selectedCustomer 
        ? { requested_for_customer: selectedCustomer.id }
        : {}),
      points_deducted_from: pointsDeductedFrom,
      remarks: remarks || undefined,
      items: items.map(item => {
        if (item.pricing_type === 'FIXED') {
          return {
            variant_id: item.id,
            quantity: item.quantity,
          };
        } else {
          // Dynamic pricing: send dynamic_quantity instead of quantity
          return {
            variant_id: item.id,
            dynamic_quantity: item.dynamic_quantity || 0,
          };
        }
      }),
      // Include service vehicle fields if any item needs driver
      ...(hasItemsNeedingDriver && svcDate && {
        svc_date: svcDate,
        svc_time: svcTime || undefined,
        svc_driver: svcDriver === 'with' ? 'WITH_DRIVER' : svcDriver === 'without' ? 'WITHOUT_DRIVER' : undefined,
      }),
    };

    const entityName = entityType === 'DISTRIBUTOR' 
      ? selectedDistributor?.name 
      : selectedCustomer?.name;

    // Close modal and reset form immediately
    items.forEach(item => onRemoveItem(item.id));
    setStep("cart");
    setRemarks("");
    setDistributorSearch("");
    setSelectedDistributor(null);
    setCustomerSearch("");
    setSelectedCustomer(null);
    setSvcDate("");
    setSvcTime("");
    setSvcDriver("");
    setPointsDeductedFrom('SELF');
    setEntityType('DISTRIBUTOR');
    onClose();

    // Show optimistic success message
    toast.success("Redemption request submitted!", {
      description: `Request for ${entityName} has been created successfully`
    });

    // Execute API call in background without blocking
    redemptionRequestsApi.createRequest(requestData)
      .then((response) => {
        // Silently succeed - user already sees success toast
        console.log("Redemption request created:", response);
      })
      .catch((error: unknown) => {
        console.error("Error submitting redemption request:", error);
        // Show error toast if submission failed
        toast.error("Failed to submit request", {
          description: error instanceof Error ? error.message : "Please try again"
        });
      });
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
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              {item.pricing_type !== 'FIXED' && (
                                <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {item.points_multiplier || item.points} pts/{DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.pricing_type === 'FIXED' ? (
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
                          ) : (
                            <div className="flex flex-col items-center gap-1 relative">
                              <div className="flex items-center gap-1">
                                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}
                                </label>
                                <button
                                  onMouseEnter={() => setShowTooltips(prev => ({ ...prev, [item.id]: true }))}
                                  onMouseLeave={() => setShowTooltips(prev => ({ ...prev, [item.id]: false }))}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                              {showTooltips[item.id] && (
                                <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-56 p-2 rounded shadow-lg text-xs ${
                                  isDark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'
                                }`}>
                                  {PRICING_TYPE_DESCRIPTIONS[item.pricing_type]}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                {(item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP') && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>$</span>
                                )}
                                <input
                                  type="number"
                                  min="0"
                                  step={item.pricing_type === 'PER_DAY' ? '1' : '0.01'}
                                  value={item.dynamic_quantity || ''}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const error = validateDynamicQuantity(val, item.pricing_type);
                                    setInputErrors(prev => ({ ...prev, [item.id]: error }));
                                    onUpdateDynamicQuantity(item.id, val);
                                  }}
                                  placeholder={
                                    item.pricing_type === 'PER_SQFT' ? 'e.g., 150' :
                                    item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP' ? 'e.g., 1234.56' :
                                    item.pricing_type === 'PER_DAY' ? 'e.g., 5' : '0'
                                  }
                                  className={`w-28 px-2 py-1 text-center rounded border outline-none ${
                                    inputErrors[item.id]
                                      ? 'border-red-500 focus:border-red-600'
                                      : isDark
                                        ? "bg-gray-800 border-gray-700 focus:border-blue-500"
                                        : "bg-gray-100 border-gray-200 focus:border-blue-500"
                                  }`}
                                />
                                {PRICING_TYPE_INPUT_HINTS[item.pricing_type] && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {PRICING_TYPE_INPUT_HINTS[item.pricing_type]}
                                  </span>
                                )}
                              </div>
                              {inputErrors[item.id] && (
                                <span className="text-xs text-red-500">{inputErrors[item.id]}</span>
                              )}
                              {!inputErrors[item.id] && item.dynamic_quantity && item.dynamic_quantity > 0 && (
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {item.dynamic_quantity} × {item.points_multiplier || item.points} pts = {getItemPoints(item).toLocaleString()} pts
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {getItemPoints(item).toLocaleString()}
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
              {/* Customer/Distributor Details */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Recipient Details</h3>
                  
                  {/* Entity Type Toggle */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEntityTypeChange('DISTRIBUTOR')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        entityType === 'DISTRIBUTOR'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Distributor
                    </button>
                    <button
                      onClick={() => handleEntityTypeChange('CUSTOMER')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        entityType === 'CUSTOMER'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    {entityType === 'DISTRIBUTOR' ? (
                      /* Distributor Search */
                      <div className="space-y-1 relative" ref={dropdownRef}>
                        <label
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Distributor Name
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
                        
                        {/* Distributor Dropdown */}
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
                    ) : (
                      /* Customer Search */
                      <div className="space-y-1 relative" ref={dropdownRef}>
                        <label
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Customer Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearchChange(e.target.value)}
                            onFocus={() => setShowCustomerDropdown(true)}
                            placeholder="Search for a customer..."
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
                        
                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearch.length >= 2 && (
                          <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-60 overflow-y-auto ${
                            isDark
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}>
                            {loadingCustomers ? (
                              <div className="px-3 py-2 text-sm text-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                  Searching...
                                </span>
                              </div>
                            ) : customers.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                  No customers found
                                </span>
                              </div>
                            ) : (
                              customers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => handleSelectCustomer(customer)}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-opacity-10 ${
                                    isDark
                                      ? "hover:bg-white"
                                      : "hover:bg-gray-900"
                                  } border-b last:border-b-0 ${
                                    isDark ? "border-gray-700" : "border-gray-200"
                                  }`}
                                >
                                  <div className="font-medium">{customer.name}</div>
                                  <div className={`text-xs ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                  }`}>
                                    {customer.location}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        
                        {selectedCustomer && (
                          <div className={`text-xs mt-1 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}>
                            ✓ Selected: {selectedCustomer.name} ({selectedCustomer.location})
                          </div>
                        )}
                      </div>
                    )}
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
                        value={entityType}
                        checked={pointsDeductedFrom === entityType}
                        onChange={() => setPointsDeductedFrom(entityType)}
                        className="w-4 h-4"
                      />
                      <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                        Deduct from {entityType === 'DISTRIBUTOR' ? "distributor's" : "customer's"} points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use - Only show if items need driver */}
              {hasItemsNeedingDriver && (
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
                        (Required for selected items)
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Date
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
              )}
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
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Submit Details
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
                        {item.pricing_type === 'FIXED' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                              {item.points_multiplier || item.points} pts/{DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}:
                              </label>
                              {(item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP') && (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>$</span>
                              )}
                              <input
                                type="number"
                                min="0"
                                step={item.pricing_type === 'PER_DAY' ? '1' : '0.01'}
                                value={item.dynamic_quantity || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const error = validateDynamicQuantity(val, item.pricing_type);
                                  setInputErrors(prev => ({ ...prev, [item.id]: error }));
                                  onUpdateDynamicQuantity(item.id, val);
                                }}
                                placeholder={
                                  item.pricing_type === 'PER_SQFT' ? 'e.g., 150' :
                                  item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP' ? 'e.g., 1234.56' :
                                  item.pricing_type === 'PER_DAY' ? 'e.g., 5' : '0'
                                }
                                className={`w-24 px-2 py-1 text-xs rounded border outline-none ${
                                  inputErrors[item.id]
                                    ? 'border-red-500 focus:border-red-600'
                                    : isDark
                                      ? "bg-gray-700 border-gray-600 focus:border-blue-500"
                                      : "bg-white border-gray-300 focus:border-blue-500"
                                }`}
                              />
                              {PRICING_TYPE_INPUT_HINTS[item.pricing_type] && (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {PRICING_TYPE_INPUT_HINTS[item.pricing_type]}
                                </span>
                              )}
                            </div>
                            {inputErrors[item.id] ? (
                              <p className="text-xs text-red-500 mt-1">
                                {inputErrors[item.id]}
                              </p>
                            ) : (
                              <p className="text-xs text-green-500 font-semibold mt-1">
                                = {getItemPoints(item).toLocaleString()} pts
                                {item.dynamic_quantity && item.dynamic_quantity > 0 && (
                                  <span className={`ml-1 font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ({item.dynamic_quantity} × {item.points_multiplier || item.points})
                                  </span>
                                )}
                              </p>
                            )}
                          </>
                        )}
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
              {/* Customer/Distributor Details */}
              <div
                className={`rounded-lg border ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="p-3">
                  <h3 className="text-sm font-semibold">Recipient Details</h3>
                  
                  {/* Entity Type Toggle */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEntityTypeChange('DISTRIBUTOR')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition ${
                        entityType === 'DISTRIBUTOR'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Distributor
                    </button>
                    <button
                      onClick={() => handleEntityTypeChange('CUSTOMER')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition ${
                        entityType === 'CUSTOMER'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-3">
                    {entityType === 'DISTRIBUTOR' ? (
                      /* Distributor Search */
                      <div className="space-y-1 relative">
                        <label
                          className={`text-xs ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Distributor Name
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
                        
                        {/* Distributor Dropdown */}
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
                    ) : (
                      /* Customer Search */
                      <div className="space-y-1 relative">
                        <label
                          className={`text-xs ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Customer Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearchChange(e.target.value)}
                            onFocus={() => setShowCustomerDropdown(true)}
                            placeholder="Search for a customer..."
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
                        
                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearch.length >= 2 && (
                          <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto ${
                            isDark
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}>
                            {loadingCustomers ? (
                              <div className="px-3 py-2 text-xs text-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                  Searching...
                                </span>
                              </div>
                            ) : customers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                  No customers found
                                </span>
                              </div>
                            ) : (
                              customers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => handleSelectCustomer(customer)}
                                  className={`w-full px-3 py-2 text-left text-xs hover:bg-opacity-10 ${
                                    isDark
                                      ? "hover:bg-white"
                                      : "hover:bg-gray-900"
                                  } border-b last:border-b-0 ${
                                    isDark ? "border-gray-700" : "border-gray-200"
                                  }`}
                                >
                                  <div className="font-medium">{customer.name}</div>
                                  <div className={`text-xs mt-0.5 ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                  }`}>
                                    {customer.location}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        
                        {selectedCustomer && (
                          <div className={`text-xs mt-1 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}>
                            ✓ {selectedCustomer.name}
                          </div>
                        )}
                      </div>
                    )}
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
                        value={entityType}
                        checked={pointsDeductedFrom === entityType}
                        onChange={() => setPointsDeductedFrom(entityType)}
                        className="w-4 h-4"
                      />
                      <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Deduct from {entityType === 'DISTRIBUTOR' ? "distributor's" : "customer's"} points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use - Only show if items need driver */}
              {hasItemsNeedingDriver && (
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
                        (Required)
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
                          <option value="">Select...</option>
                          <option value="with">With Driver</option>
                          <option value="without">Without Driver</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Submit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
