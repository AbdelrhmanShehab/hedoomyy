import { storage } from "@/lib/firestore-server-sdk";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to ArrayBuffer for the SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const storageRef = ref(storage, `payment-proofs/${Date.now()}_${file.name}`);
    
    // Upload on the server
    await uploadBytes(storageRef, buffer, {
        contentType: file.type
    });
    
    const url = await getDownloadURL(storageRef);

    return Response.json({ url });
  } catch (error) {
    console.error("API /api/upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
