(function () {
  const start = () => {
  const STORAGE_KEY = "momnt-cart-v1";
  const products = Array.isArray(window.MOMNT_PRODUCTS)
    ? window.MOMNT_PRODUCTS
    : [];

  const findProduct = (slug) =>
    products.find((product) => product.slug === slug) ?? null;

  const parsePrice = (priceLabel) => {
    const normalized = String(priceLabel ?? "")
      .replace(/[^\d,]/g, "")
      .replace(/\.(?=\d{3})/g, "")
      .replace(",", ".");

    const numericValue = Number.parseFloat(normalized);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const canSellProduct = (product) =>
    Boolean(
      product &&
      product.availability === "Pronta entrega" &&
      parsePrice(product.price) !== null,
    );

  const readStorage = () => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      const parsedValue = JSON.parse(rawValue ?? "[]");
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  };

  const sanitizeItems = (items) =>
    items
      .map((item) => ({
        slug: String(item?.slug ?? ""),
        quantity: Math.max(
          1,
          Number.parseInt(String(item?.quantity ?? 1), 10) || 1,
        ),
      }))
      .filter((item) => canSellProduct(findProduct(item.slug)));

  const dispatchCartUpdate = (items) => {
    window.dispatchEvent(
      new CustomEvent("momnt:cart-updated", {
        detail: { items },
      }),
    );
  };

  const updateCartIndicators = (items) => {
    const nextItems = items ?? sanitizeItems(readStorage());
    const totalCount = nextItems.reduce(
      (runningTotal, item) => runningTotal + item.quantity,
      0,
    );

    document.querySelectorAll("[data-cart-count]").forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      if (totalCount <= 0) {
        element.hidden = true;
        element.textContent = "";
        return;
      }

      element.hidden = false;
      element.textContent = totalCount > 99 ? "99+" : String(totalCount);
    });
  };

  const writeStorage = (items) => {
    const nextItems = sanitizeItems(items);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    } catch {}

    updateCartIndicators(nextItems);
    dispatchCartUpdate(nextItems);
    return nextItems;
  };

  const getItems = () => sanitizeItems(readStorage());

  const getDetailedItems = () =>
    getItems()
      .map((item) => {
        const product = findProduct(item.slug);
        const unitPrice = product ? parsePrice(product.price) : null;

        if (!product || unitPrice === null) {
          return null;
        }

        return {
          ...item,
          product,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      })
      .filter(Boolean);

  const addItem = (slug, quantity = 1) => {
    const product = findProduct(slug);

    if (!canSellProduct(product)) {
      return getItems();
    }

    const nextQuantity = Math.max(1, Number(quantity) || 1);
    const nextItems = [...getItems()];
    const existingItem = nextItems.find((item) => item.slug === slug);

    if (existingItem) {
      existingItem.quantity += nextQuantity;
    } else {
      nextItems.push({ slug, quantity: nextQuantity });
    }

    return writeStorage(nextItems);
  };

  const setQuantity = (slug, quantity) => {
    const nextQuantity = Number.parseInt(String(quantity), 10);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      return removeItem(slug);
    }

    const nextItems = getItems().map((item) =>
      item.slug === slug ? { ...item, quantity: nextQuantity } : item,
    );

    return writeStorage(nextItems);
  };

  const removeItem = (slug) =>
    writeStorage(getItems().filter((item) => item.slug !== slug));

  const clear = () => writeStorage([]);

  const getTotals = () => {
    const items = getDetailedItems();

    return {
      items,
      itemCount: items.reduce(
        (runningTotal, item) => runningTotal + item.quantity,
        0,
      ),
      totalValue: items.reduce(
        (runningTotal, item) => runningTotal + item.subtotal,
        0,
      ),
    };
  };

  const api = {
    addItem,
    canSellProduct,
    clear,
    findProduct,
    formatCurrency,
    getDetailedItems,
    getItems,
    getTotals,
    parsePrice,
    removeItem,
    setQuantity,
    updateCartIndicators,
  };

  window.MOMNT_CART = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateCartIndicators();
    });
  } else {
    updateCartIndicators();
  }

  window.addEventListener("momnt:cart-updated", () => {
    updateCartIndicators();
  });
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
