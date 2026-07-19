import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeInstance: Stripe | null = null;

/**
 * Lazily geïnitialiseerde Stripe-client (server-only). Lazy zodat het
 * project ook zonder Stripe-sleutels kan builden/draaien totdat de
 * checkout-route daadwerkelijk wordt aangeroepen.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripe.secretKey());
  }
  return stripeInstance;
}
