import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCustomerProfile } from "@mediators";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCustomerProfile();

  return (
    <CartProvider>
      <div className="flex min-h-full flex-1 flex-col bg-cream">
        <Header
          customerName={
            profile ? `${profile.firstName} ${profile.lastName}`.trim() : null
          }
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
