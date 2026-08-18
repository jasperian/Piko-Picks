"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  url: string;
};

export function CopyShopLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => void copyLink()}
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-midnight shadow-sm transition hover:bg-crema"
    >
      {copied ? <Check className="h-4 w-4 text-lagoon" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy shop link"}
    </button>
  );
}
