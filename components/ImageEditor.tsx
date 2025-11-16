"use client";

import NextImage from "next/image";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

type FileWithPreview = {
  file: File;
  url: string;
};

type Filters = {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
};

type Orientation = {
  rotate: number;
  flipH: boolean;
  flipV: boolean;
};

const DEFAULT_FILTERS: Filters = Object.freeze({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  sepia: 0
});

const DEFAULT_ORIENTATION: Orientation = Object.freeze({
  rotate: 0,
  flipH: false,
  flipV: false
});

function getFilterString(filters: Filters) {
  return [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `hue-rotate(${filters.hue}deg)`,
    `blur(${filters.blur}px)`,
    `sepia(${filters.sepia}%)`
  ].join(" ");
}

export default function ImageEditor() {
  const [selection, setSelection] = useState<FileWithPreview | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [orientation, setOrientation] =
    useState<Orientation>(DEFAULT_ORIENTATION);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    return () => {
      if (selection?.url) {
        URL.revokeObjectURL(selection.url);
      }
    };
  }, [selection]);

  const onSelectFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (PNG, JPG, WebP, etc).");
      return;
    }

    if (selection?.url) {
      URL.revokeObjectURL(selection.url);
    }

    setSelection({
      file,
      url: URL.createObjectURL(file)
    });
    setFilters(DEFAULT_FILTERS);
    setOrientation(DEFAULT_ORIENTATION);
  }, [selection]);

  const resetAdjustments = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setOrientation(DEFAULT_ORIENTATION);
  }, []);

  const filterStyle = useMemo(() => {
    return {
      filter: getFilterString(filters),
      transform: [
        orientation.flipH ? "scaleX(-1)" : "",
        orientation.flipV ? "scaleY(-1)" : "",
        `rotate(${orientation.rotate}deg)`
      ]
        .filter(Boolean)
        .join(" ")
        .trim()
    };
  }, [filters, orientation]);

  const downloadImage = useCallback(async () => {
    if (!selection) return;

    try {
      setIsDownloading(true);
      const img = new Image();
      img.crossOrigin = "anonymous";

      const blobData = await selection.file.arrayBuffer();
      const blob = new Blob([blobData], { type: selection.file.type });
      const blobUrl = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Unable to load the image for export."));
        img.src = blobUrl;
      });

      const hasQuarterTurn =
        Math.abs(orientation.rotate) % 180 === 90 ||
        Math.abs(orientation.rotate) % 180 === 270;

      const canvas = document.createElement("canvas");
      canvas.width = hasQuarterTurn ? img.height : img.width;
      canvas.height = hasQuarterTurn ? img.width : img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas is not supported in this browser.");
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(orientation.flipH ? -1 : 1, orientation.flipV ? -1 : 1);
      ctx.rotate((orientation.rotate * Math.PI) / 180);
      ctx.filter = getFilterString(filters);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const exportedBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), selection.file.type, 0.92)
      );

      if (!exportedBlob) {
        throw new Error("Failed to export your edited image.");
      }

      const downloadLink = document.createElement("a");
      const downloadUrl = URL.createObjectURL(exportedBlob);
      downloadLink.href = downloadUrl;
      const extension = selection.file.name.split(".").pop() ?? "png";
      downloadLink.download = `edited-${Date.now()}.${extension}`;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setIsDownloading(false);
    }
  }, [filters, orientation, selection]);

  return (
    <section className="panel">
      <h2>Upload & Edit Instantly</h2>
      <p>
        Drop a file or browse to upload your image. Everything stays local to
        your browser so you can quickly adjust it before sharing the final
        version.
      </p>

      <label className="upload-zone">
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={onSelectFile}
          aria-label="Select an image to edit"
        />
        <div className="upload-zone__inner">
          <span className="upload-zone__icon" aria-hidden>⬆</span>
          <div>
            <strong>Click to choose</strong> or drag & drop
          </div>
          <small>PNG, JPG, WebP up to ~25 MB</small>
        </div>
      </label>

      {selection && (
        <div className="editor-grid">
          <div className="preview-card">
            <div className="preview-frame">
              <div className="preview-image">
                <NextImage
                  key={selection.url}
                  src={selection.url}
                  alt="Selected preview"
                  fill
                  sizes="(max-width: 768px) 80vw, 380px"
                  unoptimized
                  style={filterStyle}
                />
              </div>
            </div>

            <div className="orientation-controls">
              <button
                type="button"
                onClick={() =>
                  setOrientation((prev) => ({
                    ...prev,
                    rotate: prev.rotate - 90
                  }))
                }
              >
                Rotate -90°
              </button>
              <button
                type="button"
                onClick={() =>
                  setOrientation((prev) => ({
                    ...prev,
                    rotate: prev.rotate + 90
                  }))
                }
              >
                Rotate +90°
              </button>
              <button
                type="button"
                onClick={() =>
                  setOrientation((prev) => ({
                    ...prev,
                    flipH: !prev.flipH
                  }))
                }
              >
                Flip Horizontal
              </button>
              <button
                type="button"
                onClick={() =>
                  setOrientation((prev) => ({
                    ...prev,
                    flipV: !prev.flipV
                  }))
                }
              >
                Flip Vertical
              </button>
            </div>
          </div>

          <div className="controls-card">
            <div className="slider">
              <label htmlFor="brightness">Brightness</label>
              <input
                id="brightness"
                type="range"
                min={40}
                max={160}
                value={filters.brightness}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    brightness: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="slider">
              <label htmlFor="contrast">Contrast</label>
              <input
                id="contrast"
                type="range"
                min={40}
                max={160}
                value={filters.contrast}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    contrast: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="slider">
              <label htmlFor="saturation">Saturation</label>
              <input
                id="saturation"
                type="range"
                min={0}
                max={200}
                value={filters.saturation}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    saturation: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="slider">
              <label htmlFor="hue">Hue Shift</label>
              <input
                id="hue"
                type="range"
                min={-180}
                max={180}
                value={filters.hue}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    hue: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="slider">
              <label htmlFor="blur">Blur</label>
              <input
                id="blur"
                type="range"
                min={0}
                max={12}
                value={filters.blur}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    blur: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="slider">
              <label htmlFor="sepia">Warmth</label>
              <input
                id="sepia"
                type="range"
                min={0}
                max={100}
                value={filters.sepia}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    sepia: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="editor-actions">
              <button
                type="button"
                className="secondary"
                onClick={resetAdjustments}
              >
                Reset
              </button>
              <button
                type="button"
                className="primary"
                disabled={isDownloading}
                onClick={downloadImage}
              >
                {isDownloading ? "Preparing…" : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
