import { z } from "zod";
import { fetcher } from "../lib/fetcher";

// const API_URL = "http://localhost:3000";
const API_URL = "https://api.frame.inflowpay.xyz";

export function createPayment(wallet: string, value: number) {
  return fetcher(
    `${API_URL}/api/createPayment`,
    z.object({
      paymentId: z.string(),
      purchaseUrl: z.string().url(),
    }),
    {
      method: "POST",
      body: JSON.stringify({
        walletAddress: wallet,
        successUrl: "https://inflowpay.xyz",
        cancelUrl: "https://inflowpay.xyz",
        products: [
          {
            name: value.toString(),
            price: value * 100,
            quantity: 1,
          },
        ],
      }),
    }
  );
}
