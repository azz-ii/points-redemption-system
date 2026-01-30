export { CreateItemModal } from "./CreateItemModal";
export { EditItemModal } from "./EditItemModal";
export { ViewItemModal } from "./ViewItemModal";
export { DeleteItemModal } from "./DeleteItemModal";
export { ViewProductModal } from "./ViewProductModal";
export { DeleteProductModal } from "./DeleteProductModal";
export { EditVariantModal } from "./EditVariantModal";
export { ExportModal } from "./ExportModal";

// Backward compatibility aliases
export { ViewProductModal as ViewVariantModal } from "./ViewProductModal";
export { DeleteProductModal as DeleteVariantModal } from "./DeleteProductModal";

export type { Product, CatalogueItem, Variant, CatalogueVariant, User } from "./types";
export { getLegendColor, LEGEND_OPTIONS, PRICING_TYPE_OPTIONS } from "./types";
