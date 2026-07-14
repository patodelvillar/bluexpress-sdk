import { pudoSelectionSchema } from "./schemas.js";
import type { PudoOrderMetadata, PudoSelection } from "./types.js";

/** Familia de producto usada por pricing cuando existe un punto de retiro. */
export const PUDO_PRODUCT_FAMILY = "PUDO" as const;

/**
 * Convierte una selección PUDO en los metadatos de orden observados en 3.2.2.
 * No incluye lógica de WooCommerce ni modifica el método de envío del consumidor.
 */
export function createPudoOrderMetadata(selection: PudoSelection): PudoOrderMetadata {
  const parsed = pudoSelectionSchema.parse(selection);

  const metadata: PudoOrderMetadata = {
    agencyId: parsed.agencyId,
    isPudoSelected: "pudoShipping"
  };

  if (parsed.agencyName !== undefined) metadata.agencyName = parsed.agencyName;
  if (parsed.agencyAddress !== undefined) metadata.agencyAddress = parsed.agencyAddress;

  return metadata;
}
