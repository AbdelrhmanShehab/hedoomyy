/** Remove edge-connected studio backgrounds; never alter the catalog image. */
export function removeStudioBackground(data: Uint8ClampedArray, width: number, height: number) {
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let tail = 0;
  const isBackground = (i: number) => {
    const low = Math.min(data[i], data[i + 1], data[i + 2]);
    const high = Math.max(data[i], data[i + 1], data[i + 2]);
    return data[i + 3] < 10 || (low >= 210 && high - low <= 22);
  };
  const visit = (n: number) => {
    if (seen[n]) return;
    seen[n] = 1;
    if (isBackground(n * 4)) queue[tail++] = n;
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  for (let head = 0; head < tail; head++) {
    const n = queue[head];
    data[n * 4 + 3] = 0;
    if (n % width) visit(n - 1);
    if (n % width < width - 1) visit(n + 1);
    if (n >= width) visit(n - width);
    if (n < width * (height - 1)) visit(n + width);
  }
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 20) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  // Do not show a blank preview if a white-on-white image cannot be separated.
  return right < left ? null : { left, top, width: right - left + 1, height: bottom - top + 1 };
}
