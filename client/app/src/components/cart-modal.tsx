import { useState, useEffect, useRef } from "react";
import { Trash2, X, ChevronDown, Info, Search } from "lucide-react";
import { distributorsApi } from "@/lib/distributors-api";
import { customersApi } from "@/lib/customers-api";
import { redemptionRequestsApi, type CreateRedemptionRequestData, type PricingType, type RequestedForType, DYNAMIC_QUANTITY_LABELS, PRICING_TYPE_DESCRIPTIONS, PRICING_TYPE_INPUT_HINTS } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  points: number; // For FIXED: per-unit points. For dynamic: points_multiplier
  image?: string;
  quantity: number; // For FIXED pricing items
  needs_driver?: boolean;
  pricing_type: PricingType;
  points_multiplier?: number | null; // For dynamic items
  dynamic_quantity?: number; // For dynamic items (sqft, invoice amount, etc.)
  available_stock: number; // Available stock for validation
  min_order_qty: number; // Minimum quantity per order
  max_order_qty: number | null; // Maximum quantity per order (null = unlimited)
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
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [remarks, setRemarks] = useState("");
  const [svcDate, setSvcDate] = useState<string>("");
  const [svcTime, setSvcTime] = useState<string>("");
  const [svcDriver, setSvcDriver] = useState<string>("without");
  const [plateNumber, setPlateNumber] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  
  // Entity type selection (Distributor or Customer)
  const [entityType, setEntityType] = useState<RequestedForType>('DISTRIBUTOR');
  
  // All entities for dropdown (preloaded)
  const [allDistributors, setAllDistributors] = useState<{id: number; name: string; location: string}[]>([]);
  const [allCustomers, setAllCustomers] = useState<{id: number; name: string; location: string}[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  
  // Selected entity
  const [selectedDistributorId, setSelectedDistributorId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  // Search/filter state for comboboxes
  const [distributorSearch, setDistributorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Refs for click-outside handling
  const distributorDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  
  // Points deduction and submission state
  const [pointsDeductedFrom, setPointsDeductedFrom] = useState<'SELF' | 'DISTRIBUTOR' | 'CUSTOMER'>('SELF');
  
  // Validation state for dynamic inputs
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const [showTooltips, setShowTooltips] = useState<Record<string, boolean>>({});

  // Load all distributors and customers when modal opens or step changes to details
  useEffect(() => {
    if (!isOpen) return;
    
    const loadEntities = async () => {
      setLoadingEntities(true);
      try {
        const [distributorsList, customersList] = await Promise.all([
          distributorsApi.getListAll(),
          customersApi.getListAll()
        ]);
        setAllDistributors(distributorsList);
        setAllCustomers(customersList);
      } catch (error) {
        console.error("Error loading entities:", error);
        toast.error("Failed to load recipients list");
      } finally {
        setLoadingEntities(false);
      }
    };
    
    // Only load if we don't have data yet
    if (allDistributors.length === 0 || allCustomers.length === 0) {
      loadEntities();
    }
  }, [isOpen]);

  // Get selected entity objects
  const selectedDistributor = allDistributors.find(d => d.id === selectedDistributorId) || null;
  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId) || null;
  
  // Filtered lists for combobox search
  const filteredDistributors = allDistributors.filter(d => 
    d.name.toLowerCase().includes(distributorSearch.toLowerCase()) ||
    d.location.toLowerCase().includes(distributorSearch.toLowerCase())
  );
  const filteredCustomers = allCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.location.toLowerCase().includes(customerSearch.toLowerCase())
  );
  
  // Click-outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (distributorDropdownRef.current && !distributorDropdownRef.current.contains(event.target as Node)) {
        setShowDistributorDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleEntityTypeChange = (type: RequestedForType) => {
    setEntityType(type);
    // Reset selections when switching type
    setSelectedDistributorId(null);
    setSelectedCustomerId(null);
    // Reset search states
    setDistributorSearch("");
    setCustomerSearch("");
    setShowDistributorDropdown(false);
    setShowCustomerDropdown(false);
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
            product_id: item.id,
            quantity: item.quantity,
          };
        } else {
          // Dynamic pricing: send dynamic_quantity instead of quantity
          return {
            product_id: item.id,
            dynamic_quantity: item.dynamic_quantity || 0,
          };
        }
      }),
      // Include service vehicle fields if any item needs driver
      ...(hasItemsNeedingDriver && svcDate && {
        svc_date: svcDate,
        svc_time: svcTime || undefined,
        svc_driver: svcDriver === 'with' ? 'WITH_DRIVER' : svcDriver === 'without' ? 'WITHOUT_DRIVER' : undefined,
        plate_number: plateNumber || undefined,
        driver_name: driverName || undefined,
      }),
    };

    const entityName = entityType === 'DISTRIBUTOR' 
      ? selectedDistributor?.name 
      : selectedCustomer?.name;

    // Close modal and reset form immediately
    items.forEach(item => onRemoveItem(item.id));
    setStep("cart");
    setRemarks("");
    setSelectedDistributorId(null);
    setSelectedCustomerId(null);
    setSvcDate("");
    setSvcTime("");
    setSvcDriver("without");
    setPlateNumber("");
    setDriverName("");
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
        className={`relative hidden md:flex flex-col mx-4 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl bg-card text-foreground`}
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
                  className={`text-sm text-muted-foreground`}
                >
                  Please review the items and quantities below before confirming
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md hover:bg-accent`}
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
                      className={`border-b border-border`}
                    >
                      <th
                        className={`text-left py-3 px-4 text-sm font-semibold text-muted-foreground`}
                      >
                        Item
                      </th>
                      <th
                        className={`text-center py-3 px-4 text-sm font-semibold text-muted-foreground`}
                      >
                        Quantity
                      </th>
                      <th
                        className={`text-right py-3 px-4 text-sm font-semibold text-muted-foreground`}
                      >
                        Points
                      </th>
                      <th
                        className={`text-right py-3 px-4 text-sm font-semibold text-muted-foreground`}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-border`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
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
                                <span className={`text-xs text-blue-600 dark:text-blue-400`}>
                                  {item.points_multiplier || item.points} pts/{DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.pricing_type === 'FIXED' ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      Math.max(item.min_order_qty, item.quantity - 1)
                                    )
                                  }
                                  disabled={item.quantity <= item.min_order_qty}
                                  className={`px-2 py-1 rounded ${
                                    item.quantity <= item.min_order_qty
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : "bg-muted hover:bg-accent"
                                  }`}
                                >
                                  −
                                </button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    const maxQty = item.max_order_qty !== null 
                                      ? Math.min(item.max_order_qty, item.available_stock)
                                      : item.available_stock;
                                    onUpdateQuantity(item.id, Math.min(item.quantity + 1, maxQty));
                                  }}
                                  disabled={
                                    item.quantity >= item.available_stock || 
                                    (item.max_order_qty !== null && item.quantity >= item.max_order_qty)
                                  }
                                  className={`px-2 py-1 rounded ${
                                    item.quantity >= item.available_stock || 
                                    (item.max_order_qty !== null && item.quantity >= item.max_order_qty)
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : "bg-muted hover:bg-accent"
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                              <span className={`text-xs ${
                                item.quantity >= item.available_stock || 
                                (item.max_order_qty !== null && item.quantity >= item.max_order_qty) 
                                  ? 'text-amber-500' 
                                  : 'text-muted-foreground'
                              }`}>
                                {item.quantity}/{item.available_stock} available
                                {item.max_order_qty !== null && ` (max ${item.max_order_qty})`}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 relative">
                              <div className="flex items-center gap-1">
                                <label className={`text-xs text-muted-foreground`}>
                                  {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}
                                </label>
                                <button
                                  onMouseEnter={() => setShowTooltips(prev => ({ ...prev, [item.id]: true }))}
                                  onMouseLeave={() => setShowTooltips(prev => ({ ...prev, [item.id]: false }))}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center bg-muted hover:bg-accent`}
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                              {showTooltips[item.id] && (
                                <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-56 p-2 rounded shadow-lg text-xs bg-card text-foreground border border-border`}>
                                  {PRICING_TYPE_DESCRIPTIONS[item.pricing_type]}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                {(item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP') && (
                                  <span className={`text-xs text-muted-foreground`}>$</span>
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
                                      : "bg-muted border-border focus:border-blue-500"
                                  }`}
                                />
                                {PRICING_TYPE_INPUT_HINTS[item.pricing_type] && (
                                  <span className={`text-xs text-muted-foreground`}>
                                    {PRICING_TYPE_INPUT_HINTS[item.pricing_type]}
                                  </span>
                                )}
                              </div>
                              {inputErrors[item.id] && (
                                <span className="text-xs text-red-500">{inputErrors[item.id]}</span>
                              )}
                              {!inputErrors[item.id] && item.dynamic_quantity && item.dynamic_quantity > 0 && (
                                <span className={`text-xs text-muted-foreground`}>
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
                  className={`text-center py-8 text-muted-foreground`}
                >
                  No items in cart
                </p>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div
                className={`px-6 py-4 border-t border-border`}
              >
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span
                      className="text-muted-foreground"
                    >
                      Your current points:
                    </span>
                    <span className="font-semibold">
                      {availablePoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-muted-foreground"
                    >
                      Total points for this request:
                    </span>
                    <span className="font-semibold text-red-500">
                      -{totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between pt-2 border-t border-border`}
                  >
                    <span
                      className="text-foreground"
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
            <div className="flex gap-2 p-6 border-t border-border">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("details")}
                disabled={items.length === 0 || remainingPoints < 0}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                  items.length === 0 || remainingPoints < 0
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header - Redemption Details */}
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Redemption Details</h2>
                <p
                  className={`text-sm text-muted-foreground`}
                >
                  Fill up the needed details below to complete your redemption
                  request
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md hover:bg-accent`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Forms */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Customer/Distributor Details */}
              <div
                className={`rounded-lg border border-border`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Recipient Details</h3>
                  
                  {/* Entity Type Toggle */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEntityTypeChange('DISTRIBUTOR')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        entityType === 'DISTRIBUTOR'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-accent'
                      }`}
                    >
                      Distributor
                    </button>
                    <button
                      onClick={() => handleEntityTypeChange('CUSTOMER')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        entityType === 'CUSTOMER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-accent'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    {entityType === 'DISTRIBUTOR' ? (
                      /* Distributor Searchable Combobox */
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Distributor Name
                        </label>
                        <div className="relative" ref={distributorDropdownRef}>
                          <div className="relative">
                            <input
                              type="text"
                              value={selectedDistributor ? `${selectedDistributor.name} - ${selectedDistributor.location}` : distributorSearch}
                              onChange={(e) => {
                                setDistributorSearch(e.target.value);
                                setSelectedDistributorId(null);
                                setShowDistributorDropdown(true);
                              }}
                              onFocus={() => setShowDistributorDropdown(true)}
                              placeholder={loadingEntities ? "Loading..." : "Search or select a distributor..."}
                              disabled={loadingEntities}
                              className={`w-full px-3 py-2 pr-10 rounded-md outline-none bg-muted border border-border ${loadingEntities ? 'opacity-50 cursor-wait' : ''}`}
                            />
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-muted-foreground`}>
                              <Search className="h-4 w-4" />
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                          
                          {/* Dropdown List */}
                          {showDistributorDropdown && !loadingEntities && (
                            <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto bg-card border-border`}>
                              {filteredDistributors.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-center">
                                  <span className="text-muted-foreground">
                                    No distributors found
                                  </span>
                                </div>
                              ) : (
                                filteredDistributors.map((distributor) => (
                                  <button
                                    key={distributor.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setSelectedDistributorId(distributor.id);
                                      setDistributorSearch("");
                                      setShowDistributorDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${selectedDistributorId === distributor.id ? 'bg-accent' : ''} border-b last:border-b-0 border-border`}
                                  >
                                    <div className="font-medium">{distributor.name}</div>
                                    <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                      {distributor.location}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Customer Searchable Combobox */
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Customer Name
                        </label>
                        <div className="relative" ref={customerDropdownRef}>
                          <div className="relative">
                            <input
                              type="text"
                              value={selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.location}` : customerSearch}
                              onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setSelectedCustomerId(null);
                                setShowCustomerDropdown(true);
                              }}
                              onFocus={() => setShowCustomerDropdown(true)}
                              placeholder={loadingEntities ? "Loading..." : "Search or select a customer..."}
                              disabled={loadingEntities}
                              className={`w-full px-3 py-2 pr-10 rounded-md outline-none bg-muted border border-border ${loadingEntities ? 'opacity-50 cursor-wait' : ''}`}
                            />
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-muted-foreground`}>
                              <Search className="h-4 w-4" />
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                          
                          {/* Dropdown List */}
                          {showCustomerDropdown && !loadingEntities && (
                            <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-48 overflow-y-auto bg-card border-border`}>
                              {filteredCustomers.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-center">
                                  <span className="text-muted-foreground">
                                    No customers found
                                  </span>
                                </div>
                              ) : (
                                filteredCustomers.map((customer) => (
                                  <button
                                    key={customer.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setSelectedCustomerId(customer.id);
                                      setCustomerSearch("");
                                      setShowCustomerDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${selectedCustomerId === customer.id ? 'bg-accent' : ''} border-b last:border-b-0 border-border`}
                                  >
                                    <div className="font-medium">{customer.name}</div>
                                    <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                      {customer.location}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label
                        className={`text-sm text-foreground`}
                      >
                        Purpose/Remarks
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter Purpose or Remarks"
                        rows={4}
                        className={`w-full px-3 py-2 rounded-md outline-none resize-none bg-muted border border-border`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Deduction */}
              <div
                className={`rounded-lg border border-border`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Points Deduction</h3>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction"
                        value="SELF"
                        checked={pointsDeductedFrom === 'SELF'}
                        onChange={() => setPointsDeductedFrom('SELF')}
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">
                        Deduct from my points
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction"
                        value={entityType}
                        checked={pointsDeductedFrom === entityType}
                        onChange={() => setPointsDeductedFrom(entityType)}
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">
                        Deduct from {entityType === 'DISTRIBUTOR' ? "distributor's" : "customer's"} points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use - Only show if items need driver */}
              {hasItemsNeedingDriver && (
                <div
                  className={`rounded-lg border border-border`}
                >
                  <div className="p-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-semibold">
                        Service Vehicle Use
                      </h3>
                      <span
                        className={`text-xs text-muted-foreground`}
                      >
                        (Required for selected items)
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          value={svcDate}
                          onChange={(e) => setSvcDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          className={`w-full px-3 py-2 rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={svcTime}
                          onChange={(e) => setSvcTime(e.target.value)}
                          className={`w-full px-3 py-2 rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Plate Number
                        </label>
                        <input
                          type="text"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          placeholder="e.g., ABC 1234"
                          className={`w-full px-3 py-2 rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          className={`text-sm text-foreground`}
                        >
                          Driver
                        </label>
                        <select
                          value={svcDriver}
                          onChange={(e) => setSvcDriver(e.target.value)}
                          className={`w-full px-3 py-2 rounded-md outline-none bg-muted border border-border`}
                        >
                          <option value="without">Without Driver</option>
                          <option value="with">With Driver</option>
                        </select>
                      </div>
                    </div>
                    {svcDriver === 'with' && (
                      <div className="mt-4">
                        <div className="space-y-1">
                          <label
                            className={`text-sm text-foreground`}
                          >
                            Driver Name
                          </label>
                          <input
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Enter driver name"
                            className={`w-full px-3 py-2 rounded-md outline-none bg-muted border border-border`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-6 border-t border-border">
              <button
                onClick={() => setStep("cart")}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Submit Details
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Modal */}
      <div
        className={`relative md:hidden mx-4 w-full max-w-md max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden bg-card text-foreground`}
      >
        {step === "cart" ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Confirm your Redemption</h2>
                <p
                  className={`text-xs text-muted-foreground`}
                >
                  Please review the items and quantities below before confirming
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md hover:bg-accent`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-80">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 border bg-muted border-border`}
                  >
                    <div className="flex gap-2">
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
                                item.quantity >= item.available_stock ? 'text-amber-500' : 'text-muted-foreground'
                              }`}
                            >
                              Qty: {item.quantity}/{item.available_stock} available
                            </p>
                          </>
                        ) : (
                          <>
                            <p className={`text-xs text-blue-600 dark:text-blue-400`}>
                              {item.points_multiplier || item.points} pts/{DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <label className={`text-xs text-muted-foreground`}>
                                {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}:
                              </label>
                              {(item.pricing_type === 'PER_INVOICE' || item.pricing_type === 'PER_EU_SRP') && (
                                <span className={`text-xs text-muted-foreground`}>$</span>
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
                                    : "bg-muted border-border focus:border-blue-500"
                                }`}
                              />
                              {PRICING_TYPE_INPUT_HINTS[item.pricing_type] && (
                                <span className={`text-xs text-muted-foreground`}>
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
                                  <span className={`ml-1 font-normal text-muted-foreground`}>
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
                  className={`text-center py-8 text-muted-foreground`}
                >
                  No items in cart
                </p>
              )}
            </div>
            {/* Summary */}
            {items.length > 0 && (
              <div
                className={`px-4 py-3 border-t space-y-2 text-xs border-border`}
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Current points:
                  </span>
                  <span className="font-semibold">
                    {availablePoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total request:
                  </span>
                  <span className="font-semibold text-red-500">
                    -{totalPoints.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-2 border-t border-border`}
                >
                  <span className="text-foreground">
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
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Redemption Details</h2>
                <p
                  className={`text-xs text-muted-foreground`}
                >
                  Fill up the needed details
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-md hover:bg-accent`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Forms */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 pb-20">
              {/* Customer/Distributor Details */}
              <div
                className={`rounded-lg border border-border`}
              >
                <div className="p-3">
                  <h3 className="text-sm font-semibold">Recipient Details</h3>
                  
                  {/* Entity Type Toggle */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEntityTypeChange('DISTRIBUTOR')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition ${
                        entityType === 'DISTRIBUTOR'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-accent'
                      }`}
                    >
                      Distributor
                    </button>
                    <button
                      onClick={() => handleEntityTypeChange('CUSTOMER')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition ${
                        entityType === 'CUSTOMER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-accent'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {entityType === 'DISTRIBUTOR' ? (
                      /* Distributor Searchable Combobox */
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Distributor Name
                        </label>
                        <div className="relative" ref={distributorDropdownRef}>
                          <div className="relative">
                            <input
                              type="text"
                              value={selectedDistributor ? `${selectedDistributor.name} - ${selectedDistributor.location}` : distributorSearch}
                              onChange={(e) => {
                                setDistributorSearch(e.target.value);
                                setSelectedDistributorId(null);
                                setShowDistributorDropdown(true);
                              }}
                              onFocus={() => setShowDistributorDropdown(true)}
                              placeholder={loadingEntities ? "Loading..." : "Search or select..."}
                              disabled={loadingEntities}
                              className={`w-full px-3 py-2 pr-10 text-sm rounded-md outline-none bg-muted border border-border ${loadingEntities ? 'opacity-50 cursor-wait' : ''}`}
                            />
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none text-muted-foreground`}>
                              <Search className="h-3 w-3" />
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </div>
                          
                          {/* Dropdown List */}
                          {showDistributorDropdown && !loadingEntities && (
                            <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-40 overflow-y-auto bg-card border-border`}>
                              {filteredDistributors.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-center">
                                  <span className="text-muted-foreground">
                                    No distributors found
                                  </span>
                                </div>
                              ) : (
                                filteredDistributors.map((distributor) => (
                                  <button
                                    key={distributor.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setSelectedDistributorId(distributor.id);
                                      setDistributorSearch("");
                                      setShowDistributorDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-xs hover:bg-accent ${selectedDistributorId === distributor.id ? 'bg-accent' : ''} border-b last:border-b-0 border-border`}
                                  >
                                    <div className="font-medium">{distributor.name}</div>
                                    <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                      {distributor.location}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        
                        {selectedDistributor && (
                          <div className={`text-xs mt-1 text-green-600 dark:text-green-400`}>
                            ✓ {selectedDistributor.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Customer Searchable Combobox */
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Customer Name
                        </label>
                        <div className="relative" ref={customerDropdownRef}>
                          <div className="relative">
                            <input
                              type="text"
                              value={selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.location}` : customerSearch}
                              onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setSelectedCustomerId(null);
                                setShowCustomerDropdown(true);
                              }}
                              onFocus={() => setShowCustomerDropdown(true)}
                              placeholder={loadingEntities ? "Loading..." : "Search or select..."}
                              disabled={loadingEntities}
                              className={`w-full px-3 py-2 pr-10 text-sm rounded-md outline-none bg-muted border border-border ${loadingEntities ? 'opacity-50 cursor-wait' : ''}`}
                            />
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none text-muted-foreground`}>
                              <Search className="h-3 w-3" />
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </div>
                          
                          {/* Dropdown List */}
                          {showCustomerDropdown && !loadingEntities && (
                            <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-40 overflow-y-auto bg-card border-border`}>
                              {filteredCustomers.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-center">
                                  <span className="text-muted-foreground">
                                    No customers found
                                  </span>
                                </div>
                              ) : (
                                filteredCustomers.map((customer) => (
                                  <button
                                    key={customer.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setSelectedCustomerId(customer.id);
                                      setCustomerSearch("");
                                      setShowCustomerDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-xs hover:bg-accent ${selectedCustomerId === customer.id ? 'bg-accent' : ''} border-b last:border-b-0 border-border`}
                                  >
                                    <div className="font-medium">{customer.name}</div>
                                    <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                      {customer.location}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        
                        {selectedCustomer && (
                          <div className={`text-xs mt-1 text-green-600 dark:text-green-400`}>
                            ✓ {selectedCustomer.name}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label
                        className={`text-xs text-foreground`}
                      >
                        Purpose/Remarks
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter Purpose or Remarks"
                        rows={3}
                        className={`w-full px-3 py-2 text-sm rounded-md outline-none resize-none bg-muted border border-border`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Deduction */}
              <div
                className={`rounded-lg border border-border`}
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
                      <span className={`text-xs text-foreground`}>
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
                      <span className={`text-xs text-foreground`}>
                        Deduct from {entityType === 'DISTRIBUTOR' ? "distributor's" : "customer's"} points
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Vehicle Use - Only show if items need driver */}
              {hasItemsNeedingDriver && (
                <div
                  className={`rounded-lg border border-border`}
                >
                  <div className="p-3">
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-sm font-semibold">
                        Service Vehicle Use
                      </h3>
                      <span
                        className={`text-xs text-muted-foreground`}
                      >
                        (Required)
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          value={svcDate}
                          onChange={(e) => setSvcDate(e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={svcTime}
                          onChange={(e) => setSvcTime(e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Plate Number
                        </label>
                        <input
                          type="text"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          placeholder="e.g., ABC 1234"
                          className={`w-full px-3 py-2 text-sm rounded-md outline-none bg-muted border border-border`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          className={`text-xs text-foreground`}
                        >
                          Driver
                        </label>
                        <select
                          value={svcDriver}
                          onChange={(e) => setSvcDriver(e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded-md outline-none bg-muted border border-border`}
                        >
                          <option value="without">Without Driver</option>
                          <option value="with">With Driver</option>
                        </select>
                      </div>
                    </div>
                    {svcDriver === 'with' && (
                      <div className="mt-3">
                        <div className="space-y-1">
                          <label
                            className={`text-xs text-foreground`}
                          >
                            Driver Name
                          </label>
                          <input
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Enter driver name"
                            className={`w-full px-3 py-2 text-sm rounded-md outline-none bg-muted border border-border`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        {step === "cart" ? (
          <div className="flex flex-col gap-2 p-4 border-t border-border">
            <button
              onClick={() => setStep("details")}
              disabled={items.length === 0 || remainingPoints < 0}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-primary-foreground ${
                items.length === 0 || remainingPoints < 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              Next
            </button>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
            >
              Back to Redeem
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 border-t border-border">
            <button
              onClick={() => setStep("cart")}
              className={`w-full px-4 py-3 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
            >
              Back
            </button>
            <button 
              onClick={handleSubmit}
              className="w-full px-4 py-3 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Submit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
