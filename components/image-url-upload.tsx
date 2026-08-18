"use client";

import { useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildShopAssetPath, isSupportedImage, SHOP_ASSETS_BUCKET } from "@/lib/uploads";

type Props = {
  label: string;
  name: string;
  defaultValue?: string;
  ownerPrefix?: string;
  uploadKind: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
};

export function ImageUrlUpload({ label, name, defaultValue = "", ownerPrefix = "draft", uploadKind, placeholder, onValueChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File) {
    if (!isSupportedImage(file)) {
      setStatus("Use PNG, JPG, WEBP, or GIF.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    setIsUploading(true);
    setStatus("Uploading...");

    if (!supabase) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onValueChange?.(objectUrl);
      setStatus("Preview ready. Supabase Storage is needed to save the uploaded file URL.");
      setIsUploading(false);
      return;
    }

    const path = buildShopAssetPath(ownerPrefix, file, uploadKind);
    const { error } = await supabase.storage.from(SHOP_ASSETS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setStatus(error.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from(SHOP_ASSETS_BUCKET).getPublicUrl(path);
    setValue(data.publicUrl);
    setPreview(data.publicUrl);
    onValueChange?.(data.publicUrl);
    setStatus("Uploaded.");
    setIsUploading(false);
  }

  return (
    <div className="text-sm font-medium text-ink/75">
      <label>
        {label}
        <input type="hidden" name={name} value={value} />
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setPreview(event.target.value);
            onValueChange?.(event.target.value);
          }}
          placeholder={placeholder ?? "https://..."}
          className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3"
        />
      </label>
      <div className="mt-2 grid gap-3 rounded-md border border-dashed border-ink/20 bg-crema p-3">
        {preview ? <img src={preview} alt="" className="h-28 w-full rounded-md object-contain bg-white p-2" /> : null}
        <label className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-roast hover:bg-roast/5">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
            }}
          />
        </label>
        {status ? <p className="text-xs text-ink/60">{status}</p> : null}
      </div>
    </div>
  );
}
