import { useState, useEffect, useRef } from "react";
import { Trash2, X, ChevronDown, Info, Search, UserPlus } from "lucide-react";
import { distributorsApi } from "@/lib/distributors-api";
import { customersApi, type Customer as FullCustomer, type SimilarCustomersResponse } from "@/lib/customers-api";
import { redemptionRequestsApi, clearCartBackend, type CreateRedemptionRequestData, type RequestedForType } from "@/lib/api";
import { toast } from "sonner";
import SimilarCustomersDialog from "./similar-customers-dialog";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  points: number; // For FIXED: per-unit points. For dynamic: points_multiplier
  image?: string;
  quantity: number; // For FIXED pricing items
  needs_driver?: boolean;
  pricing_formula?: string | null;
  points_multiplier?: number | null;
  extra_data?: Record<string, any>;
  available_stock: number; // Available stock for validation
  min_order_qty: number; // Minimum quantity per order
  max_order_qty: number | null; // Maximum quantity per order (null = unlimited)
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateExtraData?: (itemId: string, key: string, value: any) => void;
  onRemoveItem: (itemId: string) => void;
  availablePoints: number;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateExtraData,
  onRemoveItem,
  availablePoints,
}: CartModalProps) {
  const { userPosition, canSelfRequest } = useAuth();
  const isApproverWithSelfRequest = userPosition === 'Approver' && canSelfRequest;

  const [step, setStep] = useState<"cart" | "details">("cart");
  const [remarks, setRemarks] = useState("");
  const [svcDate, setSvcDate] = useState<string>("");
  const [svcTime, setSvcTime] = useState<string>("");
  const [plateNumber, setPlateNumber] = useState<string>("");
  
  // Entity type selection (Distributor or Customer)
  const [entityType, setEntityType] = useState<RequestedForType>('DISTRIBUTOR');
  
  // All entities for dropdown (preloaded)
  const [allDistributors, setAllDistributors] = useState<{id: number; name: string; brand: string; sales_channel: string}[]>([]);
  const [allCustomers, setAllCustomers] = useState<{id: number; name: string; brand: string; sales_channel: string; is_prospect: boolean}[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  
  // Selected entity
  const [selectedDistributorId, setSelectedDistributorId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  // Search/filter state for comboboxes
  const [distributorSearch, setDistributorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Prospect customer creation state
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  const [similarData, setSimilarData] = useState<SimilarCustomersResponse | null>(null);
  const [prospectName, setProspectName] = useState("");
  const [creatingProspect, setCreatingProspect] = useState(false);
  
  // Refs for click-outside handling
  const distributorDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  
  // Points deduction and submission state
  const [pointsDeductedFrom, setPointsDeductedFrom] = useState<'SELF' | 'DISTRIBUTOR'>('SELF');

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
    (d.brand || '').toLowerCase().includes(distributorSearch.toLowerCase())
  );
  const filteredCustomers = allCustomers.filter(c => 
    !c.is_prospect && (
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.brand || '').toLowerCase().includes(customerSearch.toLowerCase())
    )
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
  // Calculate points for each item based on pricing formula
  const getItemPoints = (item: CartItem): number => {
    if (!item.pricing_formula || item.pricing_formula === 'NONE') {
      return item.points * item.quantity;
    }
    
    let multiplier_from_formula = 0;
    if (item.pricing_formula === 'DRIVER_MULTIPLIER') {
      multiplier_from_formula = item.extra_data?.driver_type === 'WITH_DRIVER' ? 2 : 1;
    } else if (item.pricing_formula === 'PER_DAY') {
      multiplier_from_formula = Number(item.extra_data?.days) || 0;
    } else if (item.pricing_formula === 'PER_SQFT') {
      multiplier_from_formula = (Number(item.extra_data?.length) || 0) * (Number(item.extra_data?.width) || 0);
    } else if (item.pricing_formula === 'PER_INVOICE') {
      multiplier_from_formula = Number(item.extra_data?.invoice_amount) || 0;
    }

    return item.quantity * item.points * multiplier_from_formula;
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

  // Prospect customer creation handlers
  const handleCreateProspectClick = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProspectName(trimmed);
    setCreatingProspect(true);
    try {
      const result = await customersApi.checkSimilar(trimmed);
      if (result.exact_match || result.similar.length > 0) {
        setSimilarData(result);
        setShowSimilarDialog(true);
      } else {
        await doCreateProspect(trimmed);
      }
    } catch {
      toast.error("Failed to check for similar customers");
    } finally {
      setCreatingProspect(false);
    }
  };

  const doCreateProspect = async (name: string) => {
    setCreatingProspect(true);
    try {
      const created = await customersApi.createProspect(name);
      const newEntry = { id: created.id, name: created.name, brand: '', sales_channel: '', is_prospect: true };
      setAllCustomers(prev => [...prev, newEntry]);
      setSelectedCustomerId(created.id);
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setShowSimilarDialog(false);
      toast.success(`Prospect customer "${name}" created`);
    } catch {
      toast.error("Failed to create prospect customer");
    } finally {
      setCreatingProspect(false);
    }
  };

  const handleSelectExistingFromDialog = (customer: FullCustomer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setShowSimilarDialog(false);
    // Add to allCustomers if not already there
    if (!allCustomers.find(c => c.id === customer.id)) {
      setAllCustomers(prev => [...prev, { id: customer.id, name: customer.name, brand: customer.brand || '', sales_channel: customer.sales_channel || '', is_prospect: !!customer.is_prospect }]);
    }
  };

  const validateCartItems = (): boolean => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return false;
    }

    const missingDynamic = items.find((item) => {
      if (!item.pricing_formula || item.pricing_formula === 'NONE') return false;
      if (item.pricing_formula === 'DRIVER_MULTIPLIER') {
        if (item.extra_data?.driver_type === 'WITH_DRIVER' && (!item.extra_data?.driver_name || !item.extra_data.driver_name.trim())) return true;
      }
      if (item.pricing_formula === 'PER_DAY' && !item.extra_data?.days) return true;
      if (item.pricing_formula === 'PER_SQFT') {
        const len = Number(item.extra_data?.length);
        const wid = Number(item.extra_data?.width);
        if (!item.extra_data?.length || isNaN(len) || len <= 0 || !item.extra_data?.width || isNaN(wid) || wid <= 0) return true;
      }
      if (item.pricing_formula === 'PER_INVOICE' && !item.extra_data?.invoice_amount) return true;
      return false;
    });

    if (missingDynamic) {
      if (missingDynamic.pricing_formula === 'DRIVER_MULTIPLIER') {
        toast.error(`Please provide a driver name for "${missingDynamic.name}"`);
      } else {
        toast.error(`Please fill in the required inputs validly for "${missingDynamic.name}"`);
      }
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCartItems()) {
      setStep("details");
    }
  };

  const handleSubmit = async () => {
    // Validate entity selection based on type (skip for SELF)
    if (entityType !== 'SELF') {
      if (entityType === 'DISTRIBUTOR' && !selectedDistributor) {
        toast.error("Please select a distributor");
        return;
      }
      if (entityType === 'CUSTOMER' && !selectedCustomer) {
        toast.error("Please select a customer");
        return;
      }
    }

    if (!validateCartItems()) {
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
        if (!item.pricing_formula || item.pricing_formula === 'NONE') {
          return {
            product_id: item.id,
            quantity: item.quantity,
          };
        } else {
          // Dynamic pricing: send extra_data and quantity
          return {
            product_id: item.id,
            quantity: item.quantity,
            extra_data: item.extra_data || {},
          };
        }
      }),
      // Include service vehicle fields if any item needs driver
      ...(hasItemsNeedingDriver && svcDate && {
        svc_date: svcDate,
        svc_time: svcTime || undefined,
        plate_number: plateNumber || undefined,
      }),
    };

    const entityName = entityType === 'SELF'
      ? 'yourself'
      : entityType === 'DISTRIBUTOR' 
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
    setPlateNumber("");
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
        // Clear the persisted server-side cart after the request is confirmed
        clearCartBackend().catch(err =>
          console.warn("Failed to clear backend cart after submit:", err)
        );
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
        className={`relative hidden md:flex flex-col mx-4 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl bg-card text-foreground`}
      >
        {step === "cart" ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center">
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
                              {item.pricing_formula && item.pricing_formula !== 'NONE' && (
                                <span className={`text-xs text-blue-600 dark:text-blue-400`}>
                                  {item.points} pts / {item.pricing_formula.replace('PER_', '').toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center border-l border-r border-border">
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
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : "bg-muted hover:bg-accent"
                                }`}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min={item.min_order_qty}
                                max={item.max_order_qty !== null ? Math.min(item.max_order_qty, item.available_stock) : item.available_stock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  if (!isNaN(raw)) {
                                    const maxQty = item.max_order_qty !== null
                                      ? Math.min(item.max_order_qty, item.available_stock)
                                      : item.available_stock;
                                    onUpdateQuantity(item.id, Math.min(Math.max(raw, item.min_order_qty), maxQty));
                                  }
                                }}
                                onBlur={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  const maxQty = item.max_order_qty !== null
                                    ? Math.min(item.max_order_qty, item.available_stock)
                                    : item.available_stock;
                                  const clamped = isNaN(raw)
                                    ? item.min_order_qty
                                    : Math.min(Math.max(raw, item.min_order_qty), maxQty);
                                  onUpdateQuantity(item.id, clamped);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                }}
                                className="w-12 text-center text-sm rounded border bg-muted border-border outline-none focus:border-ring py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
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
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
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
                          
                          {item.pricing_formula && item.pricing_formula !== 'NONE' && (
                            <div className="flex flex-col items-center gap-1 mt-3 pt-3 border-t border-border relative">
                              <label className={`text-xs font-semibold text-muted-foreground`}>
                                Formula Details
                              </label>
                              
                              {item.pricing_formula === 'DRIVER_MULTIPLIER' && (
                                <div className="flex flex-col gap-2 mt-1 w-full max-w-[150px]">
                                  <select
                                    value={item.extra_data?.driver_type || 'WITHOUT_DRIVER'}
                                    onChange={(e) => onUpdateExtraData?.(item.id, 'driver_type', e.target.value)}
                                    className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                  >
                                    <option value="WITHOUT_DRIVER">Without Driver</option>
                                    <option value="WITH_DRIVER">With Driver</option>
                                  </select>
                                  {item.extra_data?.driver_type === 'WITH_DRIVER' && (
                                    <input
                                      type="text"
                                      value={item.extra_data?.driver_name || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'driver_name', e.target.value)}
                                      placeholder="Driver Name"
                                      className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  )}
                                </div>
                              )}

                              {item.pricing_formula === 'PER_DAY' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs">Days:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.extra_data?.days || ''}
                                    onChange={(e) => onUpdateExtraData?.(item.id, 'days', e.target.value)}
                                    placeholder="0"
                                    className="w-20 px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                  />
                                </div>
                              )}
                              
                              {item.pricing_formula === 'PER_SQFT' && (
                                <div className="flex flex-col gap-1 mt-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-10 text-right">Len:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.extra_data?.length || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'length', e.target.value)}
                                      placeholder="0"
                                      className="w-16 px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-10 text-right">Wid:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.extra_data?.width || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'width', e.target.value)}
                                      placeholder="0"
                                      className="w-16 px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  </div>
                                </div>
                              )}

                              {item.pricing_formula === 'PER_INVOICE' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs">Amount:</span>
                                  <span className="text-xs text-muted-foreground">$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.extra_data?.invoice_amount || ''}
                                    onChange={(e) => onUpdateExtraData?.(item.id, 'invoice_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-20 px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                  />
                                </div>
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
                    <span className="font-semibold text-red-600 dark:text-red-400">
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
                        remainingPoints >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {remainingPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                disabled={items.length === 0}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                  items.length === 0
                    ? "bg-muted cursor-not-allowed"
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
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Customer/Distributor Details */}
              <div
                className={`rounded-lg border border-border`}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Recipient Details</h3>
                  
                  {loadingEntities ? (
                    /* Skeleton Loading */
                    <div className="mt-4 space-y-4">
                      {/* Toggle buttons skeleton */}
                      <div className="flex gap-2">
                        <div className="flex-1 h-10 bg-muted animate-pulse rounded-lg" />
                        <div className="flex-1 h-10 bg-muted animate-pulse rounded-lg" />
                      </div>
                      
                      {/* Input skeleton */}
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                      
                      {/* Textarea skeleton */}
                      <div className="space-y-1">
                        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                  ) : (
                    <>
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
                              value={selectedDistributor ? `${selectedDistributor.name} - ${selectedDistributor.brand}` : distributorSearch}
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
                                      {distributor.brand}
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
                              value={selectedCustomer ? `${selectedCustomer.name}${selectedCustomer.brand ? ` - ${selectedCustomer.brand}` : ''}` : customerSearch}
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
                              {filteredCustomers.map((customer) => (
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
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{customer.name}</span>
                                      {customer.is_prospect && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                                          Prospect
                                        </span>
                                      )}
                                    </div>
                                    {customer.brand && (
                                      <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                        {customer.brand}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              {/* Create prospect option */}
                              {customerSearch.trim() && (
                                <button
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCreateProspectClick(customerSearch);
                                  }}
                                  disabled={creatingProspect}
                                  className="w-full px-3 py-2 text-left text-sm border-t border-border hover:bg-accent flex items-center gap-2 text-blue-600 dark:text-blue-400"
                                >
                                  <UserPlus className="h-3.5 w-3.5 shrink-0" />
                                  <span>{creatingProspect ? 'Checking...' : `Create prospect: "${customerSearch.trim()}"`}</span>
                                </button>
                              )}
                              {filteredCustomers.length === 0 && !customerSearch.trim() && (
                                <div className="px-3 py-2 text-sm text-center">
                                  <span className="text-muted-foreground">
                                    No customers found
                                  </span>
                                </div>
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
                    </>
                  )}
                </div>
              </div>

              {/* Points Deduction - hide for self-requests */}
              {entityType !== 'SELF' && (
              <div
                className={`rounded-lg border border-border`}
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
                      <span className="text-foreground">
                        Deduct from my points
                      </span>
                    </label>
                    {entityType === 'DISTRIBUTOR' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="points_deduction"
                        value={entityType}
                        checked={pointsDeductedFrom === entityType}
                        onChange={() => setPointsDeductedFrom(entityType)}
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">
                        Deduct from distributor's points
                      </span>
                    </label>
                    )}
                  </div>
                </div>
              </div>
              )}

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
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={() => setStep("cart")}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold bg-muted text-foreground hover:bg-accent`}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed"
              >
                Submit Details
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Modal */}
      <div
        className={`relative md:hidden mx-4 w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden bg-card text-foreground`}
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
            <div className="p-4 space-y-3 overflow-y-auto max-h-80">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 border bg-muted border-border`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        {!item.pricing_formula || item.pricing_formula === 'NONE' ? (
                          <>
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                              {item.points.toLocaleString()} pts
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.id,
                                    Math.max(item.min_order_qty, item.quantity - 1)
                                  )
                                }
                                disabled={item.quantity <= item.min_order_qty}
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                                  item.quantity <= item.min_order_qty
                                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'bg-muted hover:bg-accent'
                                }`}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min={item.min_order_qty}
                                max={item.max_order_qty !== null ? Math.min(item.max_order_qty, item.available_stock) : item.available_stock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  if (!isNaN(raw)) {
                                    const maxQty = item.max_order_qty !== null
                                      ? Math.min(item.max_order_qty, item.available_stock)
                                      : item.available_stock;
                                    onUpdateQuantity(item.id, Math.min(Math.max(raw, item.min_order_qty), maxQty));
                                  }
                                }}
                                onBlur={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  const maxQty = item.max_order_qty !== null
                                    ? Math.min(item.max_order_qty, item.available_stock)
                                    : item.available_stock;
                                  const clamped = isNaN(raw)
                                    ? item.min_order_qty
                                    : Math.min(Math.max(raw, item.min_order_qty), maxQty);
                                  onUpdateQuantity(item.id, clamped);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                }}
                                className="w-10 text-center text-xs rounded border bg-muted border-border outline-none focus:border-ring py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
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
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                                  item.quantity >= item.available_stock ||
                                  (item.max_order_qty !== null && item.quantity >= item.max_order_qty)
                                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'bg-muted hover:bg-accent'
                                }`}
                              >
                                +
                              </button>
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${
                                item.quantity >= item.available_stock ? 'text-amber-500' : 'text-muted-foreground'
                              }`}
                            >
                              {item.quantity}/{item.available_stock} available
                              {item.max_order_qty !== null && ` (max ${item.max_order_qty})`}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className={`text-xs text-blue-600 dark:text-blue-400`}>
                              {item.points} pts / {item.pricing_formula.replace('PER_', '').toLowerCase()}
                            </p>
                            
                            <div className="flex flex-col gap-1 mt-2">
                              {item.pricing_formula === 'DRIVER_MULTIPLIER' && (
                                <div className="flex flex-col gap-2 mt-1">
                                  <select
                                    value={item.extra_data?.driver_type || 'WITHOUT_DRIVER'}
                                    onChange={(e) => onUpdateExtraData?.(item.id, 'driver_type', e.target.value)}
                                    className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                  >
                                    <option value="WITHOUT_DRIVER">Without Driver</option>
                                    <option value="WITH_DRIVER">With Driver</option>
                                  </select>
                                  {item.extra_data?.driver_type === 'WITH_DRIVER' && (
                                    <input
                                      type="text"
                                      value={item.extra_data?.driver_name || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'driver_name', e.target.value)}
                                      placeholder="Driver Name"
                                      className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  )}
                                </div>
                              )}

                              {item.pricing_formula === 'PER_DAY' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs w-12">Days:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.extra_data?.days || ''}
                                    onChange={(e) => onUpdateExtraData?.(item.id, 'days', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                  />
                                </div>
                              )}
                              
                              {item.pricing_formula === 'PER_SQFT' && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-12">Length:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.extra_data?.length || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'length', e.target.value)}
                                      placeholder="0"
                                      className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-12">Width:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.extra_data?.width || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'width', e.target.value)}
                                      placeholder="0"
                                      className="w-full px-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  </div>
                                </>
                              )}

                              {item.pricing_formula === 'PER_INVOICE' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs w-12">Amount:</span>
                                  <div className="flex w-full relative">
                                    <span className="absolute left-2 top-1 text-xs text-muted-foreground">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.extra_data?.invoice_amount || ''}
                                      onChange={(e) => onUpdateExtraData?.(item.id, 'invoice_amount', e.target.value)}
                                      placeholder="0.00"
                                      className="w-full pl-5 pr-2 py-1 text-center rounded border outline-none bg-muted border-border focus:border-ring text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 border-t border-border pt-1">
                              Total: {getItemPoints(item).toLocaleString()} pts
                            </p>
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
                <>
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
                  <span className="font-semibold text-red-600 dark:text-red-400">
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
                      remainingPoints >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {remainingPoints.toLocaleString()}
                  </span>
                </div>
                </>
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
                  
                  {loadingEntities ? (
                    /* Skeleton Loading */
                    <div className="mt-3 space-y-3">
                      {/* Toggle buttons skeleton */}
                      <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-muted animate-pulse rounded-lg" />
                        <div className="flex-1 h-9 bg-muted animate-pulse rounded-lg" />
                      </div>
                      
                      {/* Input skeleton */}
                      <div className="space-y-1">
                        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                        <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                      
                      {/* Textarea skeleton */}
                      <div className="space-y-1">
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-20 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                  ) : (
                    <>
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
                      
                      <div className="mt-3 space-y-3">
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
                              value={selectedDistributor ? `${selectedDistributor.name} - ${selectedDistributor.brand}` : distributorSearch}
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
                                      {distributor.brand}
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
                              value={selectedCustomer ? `${selectedCustomer.name}${selectedCustomer.brand ? ` - ${selectedCustomer.brand}` : ''}` : customerSearch}
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
                              {filteredCustomers.map((customer) => (
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
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium">{customer.name}</span>
                                      {customer.is_prospect && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                                          Prospect
                                        </span>
                                      )}
                                    </div>
                                    {customer.brand && (
                                      <div className={`text-xs mt-0.5 text-muted-foreground`}>
                                        {customer.brand}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              {/* Create prospect option */}
                              {customerSearch.trim() && (
                                <button
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCreateProspectClick(customerSearch);
                                  }}
                                  disabled={creatingProspect}
                                  className="w-full px-3 py-2 text-left text-xs border-t border-border hover:bg-accent flex items-center gap-1.5 text-blue-600 dark:text-blue-400"
                                >
                                  <UserPlus className="h-3 w-3 shrink-0" />
                                  <span>{creatingProspect ? 'Checking...' : `Create prospect: "${customerSearch.trim()}"`}</span>
                                </button>
                              )}
                              {filteredCustomers.length === 0 && !customerSearch.trim() && (
                                <div className="px-3 py-2 text-xs text-center">
                                  <span className="text-muted-foreground">
                                    No customers found
                                  </span>
                                </div>
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
                    </>
                  )}
                </div>
              </div>

              {/* Points Deduction - hide for self-requests */}
              {entityType !== 'SELF' && (
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
                    {entityType === 'DISTRIBUTOR' && (
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
                        Deduct from distributor's points
                      </span>
                    </label>
                    )}
                  </div>
                </div>
              </div>
              )}

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
                    <div className="mt-3 grid grid-cols-2 gap-3">
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
                    <div className="mt-3 grid grid-cols-2 gap-3">
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
                    </div>
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
              onClick={handleNextStep}
              disabled={items.length === 0}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-primary-foreground ${
                items.length === 0
                  ? "bg-muted cursor-not-allowed"
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
              className="w-full px-4 py-3 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed"
            >
              Submit Details
            </button>
          </div>
        )}
      </div>

      {/* Similar Customers Dialog */}
      <SimilarCustomersDialog
        isOpen={showSimilarDialog}
        onClose={() => setShowSimilarDialog(false)}
        prospectName={prospectName}
        exactMatch={similarData?.exact_match ?? null}
        similarCustomers={similarData?.similar ?? []}
        onSelectExisting={handleSelectExistingFromDialog}
        onCreateAnyway={() => doCreateProspect(prospectName)}
        creating={creatingProspect}
      />
    </div>
  );
}
