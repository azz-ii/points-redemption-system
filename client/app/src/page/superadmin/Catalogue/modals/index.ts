export { CreateItemModal } from "./CreateItemModal";
export { EditItemModal } from "./EditItemModal";
export { ViewItemModal } from "./ViewItemModal";
export { ArchiveItemModal } from "./DeleteItemModal";
export { UnarchiveItemModal } from "./UnarchiveItemModal";
export { BulkArchiveItemModal } from "./BulkArchiveItemModal";
export { ViewProductModal } from "./ViewProductModal";
export { ArchiveProductModal } from "./DeleteProductModal";
export { EditVariantModal } from "./EditVariantModal";
export { ExportModal } from "./ExportModal";

// Backward compatibility aliases
export { ViewProductModal as ViewVariantModal } from "./ViewProductModal";
export { ArchiveProductModal as DeleteVariantModal } from "./DeleteProductModal";

export type { Product, CatalogueItem, Variant, CatalogueVariant, User } from "./types";
export { getLegendColor, LEGEND_OPTIONS, PRICING_TYPE_OPTIONS } from "./types";
