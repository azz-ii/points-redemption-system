import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEditRequest } from "@/hooks/mutations/useRequestMutations";
import {
  fetchCatalogueItems,
  type RedeemItemData,
  type UpdateRedemptionRequestData as ApiUpdateRedemptionRequestData,
  type UpdateRedemptionRequestItemData,
} from "@/lib/api";
import type { RedemptionRequest } from "./types";
import { AddItemPickerModal } from "./AddItemPickerModal";

interface EditRedemptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RedemptionRequest;
  onSaved: (request: RedemptionRequest) => void;
}

interface EditableRequestItemRow {
  rowId: string;
  itemId?: number;
  productId: number | null;
  productName: string;
  productCode: string;
  quantity: number;
  extraData: Record<string, unknown>;
  pointsPerItem: number;
  pointsMultiplier: number | null;
  minOrderQty: number;
  maxOrderQty: number | null;
  availableStock: number | null;
  pricingFormula: RedeemItemData["pricing_formula"];
}

function normalizeEmptyValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getNumericValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getFormulaLabel(
  pricingFormula: RedeemItemData["pricing_formula"],
): string {
  switch (pricingFormula) {
    case "DRIVER_MULTIPLIER":
      return "Driver Multiplier";
    case "AREA_RATE":
      return "Area Rate";
    case "PER_SQFT":
      return "Per Sqft";
    case "PER_INVOICE":
      return "Per Invoice";
    case "PER_DAY":
      return "Per Day";
    default:
      return "Standard Pricing";
  }
}

function getFormulaRowTotal(row: EditableRequestItemRow): number {
  const basePoints = row.pointsPerItem || 0;
  const quantity = row.quantity || 0;
  const multiplier = row.pointsMultiplier ?? 0;

  switch (row.pricingFormula) {
    case "DRIVER_MULTIPLIER": {
      const driverType = String(row.extraData?.driver_type ?? "").toUpperCase();
      const driverMultiplier = driverType === "WITH_DRIVER" ? 2 : 1;
      return quantity * basePoints * driverMultiplier;
    }
    case "AREA_RATE":
      return (
        quantity *
        getNumericValue(row.extraData?.length) *
        getNumericValue(row.extraData?.width) *
        getNumericValue(row.extraData?.height) *
        multiplier
      );
    case "PER_SQFT":
      return quantity * getNumericValue(row.extraData?.sqft) * multiplier;
    case "PER_INVOICE":
      return quantity * getNumericValue(row.extraData?.invoice_amount) * multiplier;
    case "PER_DAY":
      return quantity * getNumericValue(row.extraData?.days) * multiplier;
    case null:
    case "NONE":
    default:
      return quantity * basePoints;
  }
}

function getFormulaValidationError(row: EditableRequestItemRow): string | null {
  switch (row.pricingFormula) {
    case "DRIVER_MULTIPLIER": {
      const driverType = String(row.extraData?.driver_type ?? "").toUpperCase();
      if (driverType === "WITH_DRIVER" && !String(row.extraData?.driver_name ?? "").trim()) {
        return `Provide a driver name for ${row.productName || "this item"}.`;
      }
      return null;
    }
    case "AREA_RATE": {
      const length = getNumericValue(row.extraData?.length);
      const width = getNumericValue(row.extraData?.width);
      const height = getNumericValue(row.extraData?.height);
      if (length <= 0 || width <= 0 || height <= 0) {
        return `Provide length, width, and height for ${row.productName || "this item"}.`;
      }
      return null;
    }
    case "PER_SQFT": {
      const sqft = getNumericValue(row.extraData?.sqft);
      if (sqft <= 0) {
        return `Provide square footage for ${row.productName || "this item"}.`;
      }
      return null;
    }
    case "PER_INVOICE": {
      const invoiceAmount = getNumericValue(row.extraData?.invoice_amount);
      if (invoiceAmount <= 0) {
        return `Provide an invoice amount for ${row.productName || "this item"}.`;
      }
      return null;
    }
    case "PER_DAY": {
      const days = getNumericValue(row.extraData?.days);
      if (days <= 0) {
        return `Provide the number of days for ${row.productName || "this item"}.`;
      }
      return null;
    }
    default:
      return null;
  }
}

function getFormulaControls(
  row: EditableRequestItemRow,
  onUpdateRow: (rowId: string, key: string, value: unknown) => void,
) {
  switch (row.pricingFormula) {
    case "DRIVER_MULTIPLIER":
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">
              Driver Type
            </label>
            <select
              value={String(row.extraData?.driver_type ?? "WITHOUT_DRIVER")}
              onChange={(event) =>
                onUpdateRow(row.rowId, "driver_type", event.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="WITHOUT_DRIVER">Without Driver</option>
              <option value="WITH_DRIVER">With Driver</option>
            </select>
          </div>
          {String(row.extraData?.driver_type ?? "").toUpperCase() === "WITH_DRIVER" && (
            <div>
              <label className="block text-xs font-medium mb-1 text-foreground">
                Driver Name
              </label>
              <input
                type="text"
                value={String(row.extraData?.driver_name ?? "")}
                onChange={(event) =>
                  onUpdateRow(row.rowId, "driver_name", event.target.value)
                }
                className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="Driver Name"
              />
            </div>
          )}
        </div>
      );
    case "AREA_RATE":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            ["length", "Length"],
            ["width", "Width"],
            ["height", "Height"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1 text-foreground">
                {label}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={String(row.extraData?.[key] ?? "")}
                onChange={(event) =>
                  onUpdateRow(row.rowId, key, event.target.value)
                }
                className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      );
    case "PER_SQFT":
      return (
        <div>
          <label className="block text-xs font-medium mb-1 text-foreground">
            Square Footage
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={String(row.extraData?.sqft ?? "")}
            onChange={(event) => onUpdateRow(row.rowId, "sqft", event.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="0"
          />
        </div>
      );
    case "PER_INVOICE":
      return (
        <div>
          <label className="block text-xs font-medium mb-1 text-foreground">
            Invoice Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={String(row.extraData?.invoice_amount ?? "")}
            onChange={(event) =>
              onUpdateRow(row.rowId, "invoice_amount", event.target.value)
            }
            className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="0.00"
          />
        </div>
      );
    case "PER_DAY":
      return (
        <div>
          <label className="block text-xs font-medium mb-1 text-foreground">
            Days
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={String(row.extraData?.days ?? "")}
            onChange={(event) => onUpdateRow(row.rowId, "days", event.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="0"
          />
        </div>
      );
    default:
      return null;
  }
}

function createRowFromRequestItem(
  item: RedemptionRequest["items"][number],
  index: number,
): EditableRequestItemRow {
  return {
    rowId: `item-${item.id}-${index}`,
    itemId: item.id,
    productId: item.product,
    productName: item.product_name,
    productCode: item.product_code,
    quantity: item.quantity,
    extraData: item.extra_data ? { ...item.extra_data } : {},
    pointsPerItem: item.points_per_item,
    pointsMultiplier: item.points_multiplier ?? null,
    minOrderQty: 1,
    maxOrderQty: null,
    availableStock: null,
    pricingFormula:
      (item.pricing_formula as RedeemItemData["pricing_formula"]) ?? null,
  };
}

export function EditRedemptionRequestModal({
  isOpen,
  onClose,
  request,
  onSaved,
}: EditRedemptionRequestModalProps) {
  const editRequestMutation = useEditRequest();
  const [catalogueItems, setCatalogueItems] = useState<RedeemItemData[]>([]);
  const [catalogueLoaded, setCatalogueLoaded] = useState(false);
  const [remarks, setRemarks] = useState(request.initial_remarks || "");
  const [svcDate, setSvcDate] = useState(
    request.svc_date ? request.svc_date.slice(0, 10) : "",
  );
  const [svcTime, setSvcTime] = useState(
    request.svc_time ? request.svc_time.slice(0, 5) : "",
  );
  const [svcDriver, setSvcDriver] = useState<
    "WITH_DRIVER" | "WITHOUT_DRIVER" | ""
  >(
    request.svc_driver === "WITH_DRIVER" ||
      request.svc_driver === "WITHOUT_DRIVER"
      ? request.svc_driver
      : "",
  );
  const [plateNumber, setPlateNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [editedItems, setEditedItems] = useState<EditableRequestItemRow[]>(() =>
    request.items.map(createRowFromRequestItem),
  );
  const [showAddItemPicker, setShowAddItemPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalogueById = useMemo(
    () => new Map(catalogueItems.map((item) => [Number(item.id), item])),
    [catalogueItems],
  );
  const loadingCatalogue = isOpen && !catalogueLoaded;

  useEffect(() => {
    if (!isOpen) return;

    fetchCatalogueItems()
      .then((items) => {
        setCatalogueItems(items);
        setCatalogueLoaded(true);
      })
      .catch(() => {
        setCatalogueItems([]);
        setCatalogueLoaded(true);
      });
  }, [isOpen]);

  const addItemRow = (productId: number, quantity: number) => {
    const product = catalogueById.get(productId);
    if (!product) return;

    setEditedItems((current) => [
      ...current,
      {
        rowId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productId,
        productName: product.name,
        productCode: product.item_code || "",
        quantity: Math.max(product.min_order_qty || 1, quantity),
        extraData: {},
        pointsPerItem: product.points,
        pointsMultiplier: product.points_multiplier ?? null,
        minOrderQty: product.min_order_qty || 1,
        maxOrderQty: product.max_order_qty ?? null,
        availableStock: product.available_stock ?? null,
        pricingFormula: product.pricing_formula ?? null,
      },
    ]);
  };

  const updateRow = (
    rowId: string,
    updater: (row: EditableRequestItemRow) => EditableRequestItemRow,
  ) => {
    setEditedItems((current) =>
      current.map((row) => (row.rowId === rowId ? updater(row) : row)),
    );
  };

  const updateRowExtraData = (
    rowId: string,
    key: string,
    value: unknown,
  ) => {
    updateRow(rowId, (current) => ({
      ...current,
      extraData: {
        ...(current.extraData || {}),
        [key]: value,
      },
    }));
  };

  const removeRow = (rowId: string) => {
    setEditedItems((current) => current.filter((row) => row.rowId !== rowId));
  };

  const clampRowQuantity = (
    row: EditableRequestItemRow,
    nextQuantity: number,
  ) => {
    const maxByStock =
      row.availableStock !== null
        ? row.availableStock
        : Number.POSITIVE_INFINITY;
    const maxByOrder =
      row.maxOrderQty !== null ? row.maxOrderQty : Number.POSITIVE_INFINITY;
    const maxQuantity = Math.min(maxByStock, maxByOrder);
    return Math.max(row.minOrderQty, Math.min(nextQuantity, maxQuantity));
  };

  const handleAddItem = (item: RedeemItemData, quantity: number) => {
    const productId = Number(item.id);
    const existingRow = editedItems.find((row) => row.productId === productId);

    if (existingRow) {
      updateRow(existingRow.rowId, (current) => ({
        ...current,
        quantity: current.quantity + quantity,
      }));
      return;
    }

    addItemRow(productId, quantity);
  };

  const getDisplayPoints = (row: EditableRequestItemRow) => {
    return getFormulaRowTotal(row);
  };

  const totalPoints = editedItems.reduce(
    (sum, row) => sum + getDisplayPoints(row),
    0,
  );

  const shouldShowServiceFields = useMemo(
    () =>
      editedItems.some((row) => {
        const pricingFormula = row.pricingFormula ?? null;
        const driverType = String(row.extraData?.driver_type ?? "").toUpperCase();

        return pricingFormula === "DRIVER_MULTIPLIER" && driverType === "WITH_DRIVER";
      }),
    [editedItems],
  );

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);

    if (editedItems.length === 0) {
      setError("Add at least one item to save the request.");
      return;
    }

    const invalidRow = editedItems.find(
      (row) => row.productId === null || row.quantity <= 0,
    );
    if (invalidRow) {
      setError(
        "Each item must have a product selected and a quantity greater than zero.",
      );
      return;
    }

    const formulaError = editedItems.find((row) => getFormulaValidationError(row));
    if (formulaError) {
      setError(getFormulaValidationError(formulaError));
      return;
    }

    const payload: ApiUpdateRedemptionRequestData = {
      remarks: remarks.trim(),
      svc_date: shouldShowServiceFields ? normalizeEmptyValue(svcDate) : null,
      svc_time: shouldShowServiceFields ? normalizeEmptyValue(svcTime) : null,
      svc_driver: shouldShowServiceFields ? svcDriver || null : null,
      plate_number: shouldShowServiceFields ? normalizeEmptyValue(plateNumber) : null,
      driver_name: shouldShowServiceFields ? normalizeEmptyValue(driverName) : null,
      items: editedItems.map(
        (row): UpdateRedemptionRequestItemData => ({
          ...(row.itemId ? { item_id: row.itemId } : {}),
          product_id: row.productId as number,
          quantity: row.quantity,
          extra_data:
            Object.keys(row.extraData).length > 0 ? row.extraData : undefined,
        }),
      ),
    };

    try {
      const updatedRequest = await editRequestMutation.mutateAsync({
        id: request.id,
        data: payload,
      });
      onSaved(updatedRequest as RedemptionRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request");
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[65] p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border border-border max-h-[90vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-request-title"
        >
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
            <div>
              <h3 id="edit-request-title" className="text-xl font-semibold">
                Edit Request #{request.id}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update request details while it remains editable.
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
              aria-label="Close edit dialog"
              disabled={editRequestMutation.isPending}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Requested For
                </label>
                <p className="font-medium">{request.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Current Total Points
                </label>
                <p className="font-medium">{request.total_points} pts</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Request Type
                </label>
                <p className="font-medium">{request.requested_for_type}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Requested By
                </label>
                <p className="font-medium">{request.requested_by_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Points Source
                </label>
                <div className="text-sm font-medium text-foreground">
                  {request.points_deducted_from_display}
                </div>
              </div>
            </div>

            {shouldShowServiceFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-service-driver"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Service Driver
                  </label>
                  <select
                    id="edit-service-driver"
                    value={svcDriver}
                    onChange={(e) =>
                      setSvcDriver(
                        e.target.value as "WITH_DRIVER" | "WITHOUT_DRIVER" | "",
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={editRequestMutation.isPending}
                  >
                    <option value="">Not set</option>
                    <option value="WITH_DRIVER">With Driver</option>
                    <option value="WITHOUT_DRIVER">Without Driver</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-svc-date"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Service Date
                  </label>
                  <input
                    id="edit-svc-date"
                    type="date"
                    value={svcDate}
                    onChange={(e) => setSvcDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={editRequestMutation.isPending}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-svc-time"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Service Time
                  </label>
                  <input
                    id="edit-svc-time"
                    type="time"
                    value={svcTime}
                    onChange={(e) => setSvcTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={editRequestMutation.isPending}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-plate-number"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Plate Number
                  </label>
                  <input
                    id="edit-plate-number"
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={editRequestMutation.isPending}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-driver-name"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Driver Name
                  </label>
                  <input
                    id="edit-driver-name"
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={editRequestMutation.isPending}
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Items
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add, remove, or change quantity before saving.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddItemPicker(true)}
                  disabled={editRequestMutation.isPending || loadingCatalogue}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm font-medium disabled:opacity-50"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {editedItems.map((row, index) => {
                  const selectedProduct = row.productId
                    ? catalogueById.get(row.productId)
                    : null;
                  const maxQty = Math.min(
                    row.availableStock ?? Number.POSITIVE_INFINITY,
                    row.maxOrderQty ?? Number.POSITIVE_INFINITY,
                  );

                  return (
                    <div
                      key={row.rowId}
                      className="rounded-lg border border-border bg-card p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4 items-start">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Item {index + 1}
                          </p>
                          <h4 className="text-base md:text-lg font-semibold leading-tight text-foreground">
                            {row.productName || "Select a product"}
                          </h4>
                          {selectedProduct && (
                            <div className="flex flex-col gap-0.5 text-xs md:text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {selectedProduct.category}
                              </span>
                              <span>{selectedProduct.points} pts each</span>
                              <span>Min qty {row.minOrderQty}</span>
                            </div>
                          )}
                          {!selectedProduct && (
                            <p className="text-xs text-muted-foreground">
                              No product details available
                            </p>
                          )}

                          {row.pricingFormula && row.pricingFormula !== "NONE" && (
                            <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Formula Details
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getFormulaLabel(row.pricingFormula)}
                                </p>
                              </div>
                              {getFormulaControls(row, updateRowExtraData)}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-stretch gap-2 md:w-[10.5rem]">
                          <label className="block text-xs font-medium mb-1 text-foreground">
                            Quantity
                          </label>
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() =>
                                updateRow(row.rowId, (current) => ({
                                  ...current,
                                  quantity: clampRowQuantity(
                                    current,
                                    current.quantity - 1,
                                  ),
                                }))
                              }
                              disabled={
                                editRequestMutation.isPending ||
                                row.quantity <= row.minOrderQty
                              }
                              className="h-9 w-9 rounded-lg border border-border bg-muted hover:bg-accent disabled:opacity-50"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={row.minOrderQty}
                              max={Number.isFinite(maxQty) ? maxQty : undefined}
                              value={row.quantity}
                              onChange={(event) => {
                                const parsed = Number(event.target.value);
                                if (!Number.isNaN(parsed)) {
                                  updateRow(row.rowId, (current) => ({
                                    ...current,
                                    quantity: clampRowQuantity(current, parsed),
                                  }));
                                }
                              }}
                              className="flex-1 min-w-0 px-2 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center h-9"
                              disabled={editRequestMutation.isPending}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateRow(row.rowId, (current) => ({
                                  ...current,
                                  quantity: clampRowQuantity(
                                    current,
                                    current.quantity + 1,
                                  ),
                                }))
                              }
                              disabled={
                                editRequestMutation.isPending ||
                                (row.availableStock !== null &&
                                  row.quantity >= row.availableStock) ||
                                (row.maxOrderQty !== null &&
                                  row.quantity >= row.maxOrderQty)
                              }
                              className="h-9 w-9 rounded-lg border border-border bg-muted hover:bg-accent disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Min {row.minOrderQty}
                            {row.availableStock !== null
                              ? ` • Stock ${row.availableStock}`
                              : ""}
                            {row.maxOrderQty !== null
                              ? ` • Max ${row.maxOrderQty}`
                              : ""}
                          </p>

                          <button
                            onClick={() => removeRow(row.rowId)}
                            disabled={editRequestMutation.isPending}
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm font-medium disabled:opacity-50 w-full h-9"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-muted">
              <p className="text-sm font-semibold text-foreground">
                Preview Total Points
              </p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {totalPoints} Points
              </p>
            </div>

            <div>
              <label
                htmlFor="edit-remarks"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Remarks
              </label>
              <textarea
                id="edit-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                disabled={editRequestMutation.isPending}
                placeholder="Add or update request remarks..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="p-6 border-t border-border flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border disabled:opacity-50"
              disabled={editRequestMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              disabled={editRequestMutation.isPending}
            >
              {editRequestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      <AddItemPickerModal
        isOpen={showAddItemPicker}
        items={catalogueItems}
        loading={loadingCatalogue}
        error={null}
        onClose={() => setShowAddItemPicker(false)}
        onConfirm={(item, quantity) => {
          setError(null);
          handleAddItem(item, quantity);
        }}
      />
    </>
  );
}
