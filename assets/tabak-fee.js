/**
 * Tabak fee
 *
 * Auto-manages a linked "fee" product whose quantity mirrors the number of
 * tabak (tobacco) units in the cart. Modeled on gift-wrapping.js: on every
 * cart render this element compares the desired fee quantity (tabak units)
 * against the fee quantity currently in the cart and, if they differ, updates
 * the cart via /cart/update.js. The resulting cartUpdate re-renders the cart
 * section, remounting this element; once the quantities match it does nothing,
 * so the loop terminates on its own.
 */
class TabakFeeComponent extends HTMLElement {
  constructor() {
    super();

    this.feeId = this.dataset.tabakFeeId;
    this.tabakUnits = parseInt(this.dataset.tabakUnits, 10) || 0;
    this.feeInCart = parseInt(this.dataset.feeInCart, 10) || 0;
  }

  connectedCallback() {
    if (!this.feeId || typeof MinimogSettings === "undefined") return;
    // Already in sync — nothing to do (this is what stops the reconcile loop).
    if (this.tabakUnits === this.feeInCart) return;

    this.sync();
  }

  getSectionsToUpdate() {
    const sections = [];
    document.documentElement.dispatchEvent(
      new CustomEvent("cart:grouped-sections", { bubbles: true, detail: { sections } })
    );
    return sections;
  }

  sync() {
    const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
    const config = {
      method: "POST",
      headers,
      body: JSON.stringify({
        updates: { [this.feeId]: this.tabakUnits },
        sections: this.getSectionsToUpdate(),
      }),
    };

    fetch(`${MinimogSettings.routes.cart_update_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        MinimogEvents.emit(MinimogTheme.pubSubEvents.cartUpdate, { cart: response });
        document.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart: response } }));
      })
      .catch((e) => console.error("Tabak fee sync failed:", e));
  }
}

customElements.define("m-tabak-fee-component", TabakFeeComponent);
