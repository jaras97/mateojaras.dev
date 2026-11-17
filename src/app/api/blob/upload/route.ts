import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import {
  hasBlobToken,
  isAllowedUploadPath,
  MAX_UPLOAD_BYTES,
  UPLOAD_CONTENT_TYPES,
} from "@/lib/blob";
import { requireSessionForRequest } from "@/lib/dal";

// Issues scoped client-upload tokens for project images. The URL reaches the
// database only through the project form's save action, never from a callback.
export async function POST(request: Request) {
  const guard = await requireSessionForRequest(request);
  if (!guard.ok) return guard.response;
  if (!hasBlobToken()) {
    return Response.json(
      { error: "missing BLOB_READ_WRITE_TOKEN" },
      { status: 503 },
    );
  }
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedUploadPath(pathname)) {
          throw new Error("pathname not allowed");
        }
        return {
          allowedContentTypes: UPLOAD_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "upload failed" },
      { status: 400 },
    );
  }
}
