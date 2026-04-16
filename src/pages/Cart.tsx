import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const { items, setQty, remove, total } = useCart();
  const shipping = total > 150 || total === 0 ? 0 : 15;

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Your bag</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-10">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-border">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-display text-2xl mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Discover pieces that define your edge.</p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-smooth">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            <div className="divide-y divide-border border-y border-border">
              {items.map(i => (
                <div key={i.product.id + i.size} className="py-6 flex gap-5">
                  <Link to={`/product/${i.product.id}`} className="w-24 sm:w-32 aspect-[4/5] bg-secondary overflow-hidden shrink-0">
                    <img src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{i.product.category}</p>
                        <Link to={`/product/${i.product.id}`} className="font-medium hover:text-gold transition-smooth">{i.product.name}</Link>
                        <p className="text-xs text-muted-foreground mt-1">Size: {i.size}</p>
                      </div>
                      <button onClick={() => remove(i.product.id, i.size)} className="text-muted-foreground hover:text-destructive transition-smooth h-fit">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4">
                      <div className="flex items-center border border-border">
                        <button onClick={() => setQty(i.product.id, i.size, i.qty - 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span className="w-9 text-center text-sm">{i.qty}</span>
                        <button onClick={() => setQty(i.product.id, i.size, i.qty + 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      </div>
                      <p className="font-semibold">${(i.product.price * i.qty).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-secondary p-8 self-start sticky top-32">
              <h3 className="font-display text-2xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Calculated at checkout</span></div>
              </div>
              <div className="mt-6 pt-6 border-t border-border flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${(total + shipping).toFixed(2)}</span>
              </div>
              <button className="w-full mt-8 bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3">
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/shop" className="block text-center mt-4 text-xs uppercase tracking-[0.2em] link-underline w-fit mx-auto">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Cart;
