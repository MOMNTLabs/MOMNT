(function () {
  const start = () => {
  const root = document.querySelector("#cart-page-root");
  const cart = window.MOMNT_CART;

  if (!root || !cart) {
    return;
  }

  const render = () => {
    const { items, itemCount, totalValue } = cart.getTotals();

    if (!items.length) {
      root.innerHTML = `
        <article class="not-found-card reveal is-visible">
          <span class="breadcrumb">Carrinho vazio</span>
          <h1>Você ainda não adicionou nenhum modelo.</h1>
          <p>
            Escolha um produto na vitrine, adicione ao carrinho e volte aqui para
            revisar o pedido antes de seguir para o checkout.
          </p>
          <div class="catalog-card-actions">
            <a class="shop-button shop-button-primary" href="produtos.html">
              Ir para produtos
            </a>
            <a class="shop-button shop-button-secondary" href="index.html#top">
              Voltar para a home
            </a>
          </div>
        </article>
      `;
      document.title = "MOMNT | Carrinho";
      return;
    }

    root.innerHTML = `
      <section class="cart-layout">
        <div class="cart-list-shell reveal is-visible">
          <div class="cart-list-header">
            <span class="breadcrumb">Seu carrinho</span>
            <h1>${itemCount} ${itemCount === 1 ? "item" : "itens"} prontos para revisar</h1>
          </div>

          <div class="cart-list">
            ${items
              .map(
                (item) => `
                  <article class="cart-item" data-cart-item="${item.product.slug}">
                    <img
                      class="cart-item-image"
                      src="${item.product.images[0]}"
                      alt="${item.product.name}"
                      loading="lazy"
                    />

                    <div class="cart-item-copy">
                      <span class="catalog-card-meta">${item.product.categoryLabel} collection</span>
                      <h2>${item.product.name}</h2>
                      <p>${item.product.shortDescription}</p>
                      <strong>${item.product.price}</strong>
                    </div>

                    <div class="cart-item-controls">
                      <div class="quantity-stepper quantity-stepper-compact">
                        <button type="button" data-quantity-decrease="${item.product.slug}" aria-label="Diminuir quantidade">
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value="${item.quantity}"
                          inputmode="numeric"
                          data-quantity-input="${item.product.slug}"
                          aria-label="Quantidade de ${item.product.name}"
                        />
                        <button type="button" data-quantity-increase="${item.product.slug}" aria-label="Aumentar quantidade">
                          +
                        </button>
                      </div>

                      <strong class="cart-item-subtotal">${cart.formatCurrency(item.subtotal)}</strong>

                      <button
                        class="cart-remove-button"
                        type="button"
                        data-remove-item="${item.product.slug}"
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>

        <aside class="summary-card reveal is-visible">
          <span class="breadcrumb">Resumo</span>
          <h2>Fechar pedido</h2>

          <div class="summary-list">
            <div class="summary-row">
              <span>Itens no carrinho</span>
              <strong>${itemCount}</strong>
            </div>
            <div class="summary-row">
              <span>Entrega local</span>
              <strong>A confirmar</strong>
            </div>
            <div class="summary-row summary-row-total">
              <span>Total estimado</span>
              <strong>${cart.formatCurrency(totalValue)}</strong>
            </div>
          </div>

          <div class="summary-actions">
            <a class="shop-button shop-button-primary" href="checkout.html">
              Ir para checkout
            </a>
            <a class="shop-button shop-button-secondary" href="produtos.html">
              Continuar comprando
            </a>
          </div>

          <button class="summary-clear-button" type="button" data-clear-cart>
            Limpar carrinho
          </button>
        </aside>
      </section>
    `;

    document.title = `MOMNT | Carrinho (${itemCount})`;

    root.querySelectorAll("[data-quantity-decrease]").forEach((button) => {
      button.addEventListener("click", () => {
        const slug = button.getAttribute("data-quantity-decrease");

        if (!slug) {
          return;
        }

        const currentItem = cart.getItems().find((item) => item.slug === slug);

        if (!currentItem) {
          return;
        }

        cart.setQuantity(slug, currentItem.quantity - 1);
        render();
      });
    });

    root.querySelectorAll("[data-quantity-increase]").forEach((button) => {
      button.addEventListener("click", () => {
        const slug = button.getAttribute("data-quantity-increase");

        if (!slug) {
          return;
        }

        const currentItem = cart.getItems().find((item) => item.slug === slug);

        if (!currentItem) {
          return;
        }

        cart.setQuantity(slug, currentItem.quantity + 1);
        render();
      });
    });

    root.querySelectorAll("[data-quantity-input]").forEach((input) => {
      input.addEventListener("change", () => {
        if (!(input instanceof HTMLInputElement)) {
          return;
        }

        const slug = input.getAttribute("data-quantity-input");

        if (!slug) {
          return;
        }

        cart.setQuantity(slug, input.value);
        render();
      });
    });

    root.querySelectorAll("[data-remove-item]").forEach((button) => {
      button.addEventListener("click", () => {
        const slug = button.getAttribute("data-remove-item");

        if (!slug) {
          return;
        }

        cart.removeItem(slug);
        render();
      });
    });

    const clearButton = root.querySelector("[data-clear-cart]");
    clearButton?.addEventListener("click", () => {
      cart.clear();
      render();
    });
  };

  render();
  window.addEventListener("momnt:cart-updated", render);
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
