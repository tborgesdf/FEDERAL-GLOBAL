/**
 * WEBHOOK INFINITEPAY
 * Recebe confirmações de pagamento e cria applications
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin, logAudit } from "../lib/supabase-admin";
import { verifyInfinitePaySignature } from "../lib/crypto";

interface InfinitePayWebhookPayload {
  event: string; // 'charge.paid', 'charge.failed', etc
  data: {
    id: string;
    status: "pending" | "paid" | "failed" | "refunded";
    amount: number; // em centavos
    currency: string;
    metadata?: {
      user_id?: string;
      visa_type?: "first" | "renewal";
    };
    created_at: string;
    updated_at: string;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Verificar assinatura
    const signature = req.headers["x-infinitepay-signature"] as string;
    const secret = process.env.INFINITEPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("INFINITEPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const rawBody = JSON.stringify(req.body);
    
    if (!signature || !verifyInfinitePaySignature(rawBody, signature, secret)) {
      await logAudit({
        action: "webhook.infinitepay.invalid_signature",
        details: { signature, hasSecret: !!secret },
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    // 2. Parse payload
    const payload: InfinitePayWebhookPayload = req.body;
    const { event, data: txData } = payload;

    await logAudit({
      action: `webhook.infinitepay.${event}`,
      details: { transactionId: txData.id, status: txData.status },
    });

    // 3. Upsert payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .upsert(
        {
          provider: "infinitepay",
          provider_tx_id: txData.id,
          status: txData.status,
          amount_cents: txData.amount,
          currency: txData.currency || "BRL",
          raw: txData as any,
          metadata: txData.metadata || {},
          user_id: txData.metadata?.user_id || null,
        },
        { onConflict: "provider_tx_id" }
      )
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to upsert payment:", paymentError);
      return res.status(500).json({ error: "Failed to persist payment" });
    }

    // 4. Se pagamento confirmado, criar application (se não existir)
    if (txData.status === "paid" && txData.metadata?.user_id && txData.metadata?.visa_type) {
      const { data: existingApp } = await supabaseAdmin
        .from("applications")
        .select("id")
        .eq("payment_id", payment.id)
        .single();

      if (!existingApp) {
        const { error: appError } = await supabaseAdmin
          .from("applications")
          .insert({
            user_id: txData.metadata.user_id,
            payment_id: payment.id,
            visa_type: txData.metadata.visa_type,
            step: "civil_status",
            status: "in_progress",
          });

        if (appError) {
          console.error("Failed to create application:", appError);
          // Não retornar erro 500, pois payment foi salvo
        } else {
          await logAudit({
            userId: txData.metadata.user_id,
            action: "application.created_from_payment",
            details: {
              paymentId: payment.id,
              visaType: txData.metadata.visa_type,
            },
          });
        }
      }
    }

    // 5. Responder sucesso
    return res.status(200).json({ ok: true, paymentId: payment.id });
  } catch (error: any) {
    console.error("InfinitePay webhook error:", error);
    await logAudit({
      action: "webhook.infinitepay.error",
      details: { error: error.message },
    });
    return res.status(500).json({ error: "Internal server error" });
  }
}

