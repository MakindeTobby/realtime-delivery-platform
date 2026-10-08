import { useEffect, useState, type ChangeEvent } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";
import { getAccessToken } from "@/lib/auth-session";

type ImageUploadEndpoint = "restaurantImage" | "menuItemImage";

type ImageUploadFieldProps = {
  endpoint: ImageUploadEndpoint;
  label: string;
  value?: string | null;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function ImageUploadField({
  endpoint,
  label,
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    headers: () => {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return headers;
    },
    onClientUploadComplete: (files) => {
      const uploadedUrl = files[0]?.ufsUrl;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        setPreview(undefined);
        setError(undefined);
      }
    },
    onUploadError: (uploadError) => {
      setError(uploadError.message || "The image could not be uploaded. Please try again.");
      setPreview(undefined);
    },
  });

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setError(undefined);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Choose an image smaller than 4 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    await startUpload([file]);
  }

  const imageUrl = preview ?? value ?? undefined;
  const busy = disabled || isUploading;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed p-3">
        {imageUrl ? (
          <img src={imageUrl} alt={`${label} preview`} className="size-20 rounded-md bg-muted object-cover" />
        ) : (
          <div className="grid size-20 place-items-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">
            <ImagePlus className="size-7" />
          </div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50">
            {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {isUploading ? "Uploading…" : imageUrl ? "Change image" : "Choose image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void handleFileChange(event)}
              disabled={busy}
            />
          </label>
          {imageUrl && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setPreview(undefined);
                onChange(undefined);
                setError(undefined);
              }}
            >
              <X className="size-4" /> Remove
            </Button>
          )}
          <p className="basis-full text-xs text-muted-foreground">Image file, up to 4 MB. Upload starts when you choose a file.</p>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
