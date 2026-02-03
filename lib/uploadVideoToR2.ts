export async function uploadVideoToR2(
  file: File,
  folder: "training" | "instructors" = "training"
): Promise<string> {
  const res = await fetch("/api/videos/r2-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type || "video/mp4",
      folder, // 🔥 CRITICAL
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get R2 upload URL");
  }

  const { uploadUrl, publicUrl } = await res.json();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "video/mp4",
    },
    body: file, // streamed by browser
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`R2 upload failed: ${text}`);
  }

  return publicUrl;
}
