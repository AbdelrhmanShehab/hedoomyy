import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Utility to fetch download URL for an image.
 * If future image handling uses Firebase Storage paths (e.g., 'products/img1.png'),
 * this function will dynamically fetch the download URL.
 * Currently, it instantly returns any valid HTTP URL.
 */
export async function getDynamicImageUrl(imagePath: string): Promise<string> {
  if (!imagePath) return "/1.png";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("/")
  ) {
    return imagePath;
  }

  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error(`Failed to fetch dynamic URL for ${imagePath}:`, error);
    return "/1.png";
  }
}

/**
 * Error handling fallback for standard <img> tags.
 * Replaces broken images with a placeholder to prevent UI breakage
 * and logs the failed URL.
 */
export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string = "/1.png") {
  const target = e.currentTarget;
  if (target.src !== window.location.origin + fallbackSrc) {
    console.error(`Image failed to load: ${target.src}, switching to fallback.`);
    target.src = fallbackSrc;
    target.srcset = ""; // Clear srcset to enforce fallback
  }
}
