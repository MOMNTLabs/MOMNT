(function () {
  const root = document.querySelector("#checkout-page-root");
  const cart = window.MOMNT_CART;

  if (!root || !cart) {
    return;
  }

  const buildWhatsappUrl = (message) =>
    `https://wa.me/5511963238610?text=${encodeURIComponent(message)}`;

  const buildOrderMessage = (formValues, totals) => {
    const itemsBlock = totals.items
      .map(
        (item) =>
          `- ${item.product.name} x${item.quantity} (${cart.formatCurrency(item.subtotal)})`,
      )
      .join("\n");

    return [
      "Oi, quero finalizar meu pedido da MOMNT.",
      "",
      "Cliente:",
      `Nome: ${formValues.name}`,
      `WhatsApp: ${formValues.phone}`,
      `Email: ${formValues.email || "Nao informado"}`,
      "",
      "Entrega:",
      `Metodo: ${formValues.fulfillment}`,
      `Endereco ou observacao: ${formValues.address || "A confirmar"}`,
      "",
      "Pagamento:",
      formValues.payment,
      "",
      "Pedido:",
      itemsBlock,
      "",
      `Total estimado: ${cart.formatCurrency(totals.totalValue)}`,
    ].join("\n");
  };

  const render = () => {
    const totals = cart.getTotals();

    if (!totals.items.length) {
      root.innerHTML = `
        <article class="not-found-card reveal is-visible">
          <span class="breadcrumb">Checkout indisponivel</span>
          <h1>Seu carrinho esta vazio.</h1>
          <p>
            Antes de seguir para o checkout, adicione pelo menos um produto ao
            carrinho na pagina de produto.
          </p>
          <div class="catalog-card-actions">
            <a class="shop-button shop-button-primary" href="produtos.html">
              Ver produtos
            </a>
            <a class="shop-button shop-button-secondary" href="carrinho.html">
              Ir para o carrinho
            </a>
          </div>
        </article>
      `;
      document.title = "MOMNT | Checkout";
      return;
    }

    root.innerHTML = `
      <section class="checkout-layout">
        <div class="checkout-form-shell reveal is-visible">
          <div class="cart-list-header">
            <span class="breadcrumb">Checkout</span>
            <h1>Feche o pedido com seus dados</h1>
          </div>

          <form class="checkout-form" id="checkout-form">
            <div class="field-grid">
              <label class="field">
                <span>Nome completo</span>
                <input type="text" name="name" required placeholder="Seu nome" />
              </label>

              <label class="field">
                <span>WhatsApp</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="(11) 99999-9999"
                />
              </label>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="voce@exemplo.com"
                />
              </label>

              <label class="field">
                <span>Forma de pagamento</span>
                <select name="payment" required>
                  <option value="PIX">PIX</option>
                  <option value="Cartao">Cartao</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </label>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Entrega ou retirada</span>
                <select name="fulfillment" required>
                  <option value="Retirada">Retirada</option>
                  <option value="Entrega local">Entrega local</option>
                </select>
              </label>

              <label class="field field-full">
                <span>Endereco ou observacoes</span>
                <textarea
                  name="address"
                  rows="4"
                  placeholder="Endereco, ponto de referencia ou observacoes do pedido"
                ></textarea>
              </label>
            </div>

            <div class="checkout-actions">
              <button class="shop-button shop-button-primary" type="submit">
                Finalizar no WhatsApp
              </button>
              <a class="shop-button shop-button-secondary" href="carrinho.html">
                Voltar para o carrinho
              </a>
            </div>

            <p class="checkout-note">
              O checkout fecha pelo WhatsApp para validar entrega, pagamento e
              disponibilidade final.
            </p>
          </form>
        </div>

        <aside class="summary-card reveal is-visible">
          <span class="breadcrumb">Resumo do pedido</span>
          <h2>${totals.itemCount} ${totals.itemCount === 1 ? "item" : "itens"} no checkout</h2>

          <div class="checkout-summary-list">
            ${totals.items
              .map(
                (item) => `
                  <div class="checkout-summary-item">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" loading="lazy" />
                    <div>
                      <strong>${item.product.name}</strong>
                      <span>${item.quantity} x ${item.product.price}</span>
                    </div>
                    <strong>${cart.formatCurrency(item.subtotal)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div class="summary-list">
            <div class="summary-row summary-row-total">
              <span>Total estimado</span>
              <strong>${cart.formatCurrency(totals.totalValue)}</strong>
            </div>
          </div>
        </aside>
      </section>
    `;

    document.title = "MOMNT | Checkout";

    const checkoutForm = root.querySelector("#checkout-form");

    checkoutForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!(checkoutForm instanceof HTMLFormElement)) {
        return;
      }

      const formData = new FormData(checkoutForm);
      const formValues = {
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        fulfillment: String(formData.get("fulfillment") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        payment: String(formData.get("payment") ?? "").trim(),
      };

      const whatsappUrl = buildWhatsappUrl(
        buildOrderMessage(formValues, totals),
      );
      window.open(whatsappUrl, "_blank", "noopener");
    });
  };

  render();
  window.addEventListener("momnt:cart-updated", render);
})();
