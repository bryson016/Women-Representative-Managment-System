import { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * SafeImage — a reusable image component that:
 *  - Renders a real <img> with object-fit: cover
 *  - Provides meaningful alt text (required)
 *  - Falls back to a styled purple placeholder if the image fails to load
 */
function SafeImage({ src, alt, className = "", fallbackClassName = "", icon: FallbackIcon }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const Icon = FallbackIcon || ImageOff;
    return (
      <div
        role="img"
        aria-label={alt || "Image unavailable"}
        className={`safe-image-fallback ${fallbackClassName}`.trim()}
      >
        <Icon size={28} aria-hidden="true" />
        <span>{alt || "Image unavailable"}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default SafeImage;