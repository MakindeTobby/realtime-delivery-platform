import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../../../api/src/uploadthing/upload-router";
import { getAccessToken } from "./auth-session";

const uploadthingUrl = `${import.meta.env.VITE_API_URL || "/api"}/uploadthing`;

export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  url: uploadthingUrl,
  fetch: async (input, init) => {
    const requestUrl = input instanceof Request ? input.url : input.toString();
    const isUploadthingRequest = requestUrl.startsWith(uploadthingUrl);
    if (!isUploadthingRequest) return fetch(input, init);

    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  },
});
