/**
 * Returns the `Document` that owns the given node, falling back to the global
 * `document`. Lets the modal logic work across iframes / portaled containers.
 */
export function ownerDocument(node: Node | null | undefined): Document {
  return node?.ownerDocument ?? document
}
