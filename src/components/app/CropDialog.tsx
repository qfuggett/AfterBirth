import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RotateCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { transformImage } from "@/lib/ocr";

/** Crop and rotate a copy of an image. The original file is kept unchanged. */
export function CropDialog({
  open,
  onOpenChange,
  source,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  source: Blob | null;
  onDone: (edited: Blob) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!source) return;
    const u = URL.createObjectURL(source);
    setUrl(u);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    return () => URL.revokeObjectURL(u);
  }, [source]);

  const apply = async () => {
    if (!source) return;
    setBusy(true);
    try {
      // Rotate first, then crop the rotated image using the selected area.
      const rotated = rotation ? await transformImage(source, rotation) : source;
      const out = area ? await transformImage(rotated, 0, area) : rotated;
      onDone(out);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl bg-paper">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Crop & rotate</DialogTitle>
          <DialogDescription>This makes an edited copy. Your original photo is kept.</DialogDescription>
        </DialogHeader>
        <div className="relative h-80 overflow-hidden rounded-2xl bg-foreground/90">
          {url ? (
            <Cropper
              image={url}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={undefined as unknown as number}
              objectFit="contain"
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, px) => setArea(px)}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="zoom" className="text-[0.95rem] font-semibold">
            Zoom
          </label>
          <Slider id="zoom" min={1} max={4} step={0.05} value={[zoom]} onValueChange={(v) => setZoom(v[0] ?? 1)} className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
            <RotateCw aria-hidden /> Rotate
          </Button>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={busy}>
            Save edited copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
