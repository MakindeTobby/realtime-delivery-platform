import { generateReactNativeHelpers } from "@uploadthing/expo"
import type { OurFileRouter } from '../../../api/src/uploadthing/upload-router'
import { getAccessToken } from './auth'

const uploadthingUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/api/uploadthing`;

export const { useImageUploader, useDocumentUploader } = generateReactNativeHelpers<OurFileRouter>({
    url: uploadthingUrl,
    fetch: async (input, init) => {
        const requestUrl = input instanceof Request ? input.url : input.toString();
        const isUploadthingRequest = requestUrl.startsWith(uploadthingUrl);

        if (!isUploadthingRequest) return fetch(input, init);

        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
        const token = await getAccessToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);

        return fetch(input, { ...init, headers });
    },
})
