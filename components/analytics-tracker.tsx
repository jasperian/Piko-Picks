"use client";

import { useEffect } from "react";
import type { AnalyticsEventType } from "@/lib/analytics";

type Props = {
  shopId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
};

export function AnalyticsTracker({ shopId, eventType, metadata }: Props) {
  useEffect(() => {
    void trackAnalyticsEvent(shopId, eventType, metadata);
  }, [eventType, metadata, shopId]);

  return null;
}

export async function trackAnalyticsEvent(shopId: string, eventType: AnalyticsEventType, metadata?: Record<string, unknown>) {
  await fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      shopId,
      eventType,
      metadata
    }),
    keepalive: true
  }).catch(() => undefined);
}
