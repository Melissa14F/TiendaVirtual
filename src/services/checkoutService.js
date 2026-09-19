import { getProductById, decrementStock } from './productsService';
import { createOrder } from './ordersService';
import { incrementUsage as incrementDiscountUsage } from './discountsService';

/** Shared by every place an order can be placed (header cart drawer, "Mi
 * carrito" tab, "Comprar ahora"): re-checks real stock right before
 * ordering (it can change between adding an item to the cart and
 * actually checking out — another purchase, an admin adjustment), then
 * creates the order + its lines in MockAPI and decrements stock per
 * item. `orderDetails` (address/postalCode/paymentMethod) comes from
 * CheckoutModal — the client confirms or edits them right before the
 * order is placed, instead of it silently reusing whatever's saved on
 * the profile. `discountId`, when a coupon was applied, gets its usage
 * counter bumped — best-effort, fire-and-forget: a failure here
 * shouldn't make an otherwise-successful order look failed to the
 * client, it would just mean that coupon's use count is one behind
 * reality. */
// Valida el stock real, crea el pedido (+ sus líneas) y descuenta el
// stock de cada producto. Lo usan tanto el carrito como "Comprar ahora".
export async function placeOrder({ clienteName, items, discountAmount = 0, orderDetails, discountId }) {
  const freshProducts = await Promise.all(items.map(item => getProductById(item.id)));
  const shortIndex = freshProducts.findIndex((p, i) => p.stockQty < items[i].qty);
  if (shortIndex !== -1) {
    const short = freshProducts[shortIndex];
    throw new Error(
      short.stockQty > 0
        ? `Solo quedan ${short.stockQty} unidades de "${short.name}". Ajustá la cantidad para continuar.`
        : `"${short.name}" ya no tiene stock disponible.`
    );
  }

  await createOrder({ clienteName, items, ...orderDetails, discountAmount });
  await Promise.all(items.map(item => decrementStock(item.id, item.qty)));
  if (discountId) incrementDiscountUsage(discountId).catch(() => {});
}
