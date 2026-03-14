import httpClient from "../utils/http-client.js";
import { toServiceError } from "../utils/service-error.js";

const RESOURCE_URL = "/recipes";
const RESERVED_VIDEO_TAG = "video";

export async function listRecipes(query = {}) {
  try {
    const response = await httpClient.get(RESOURCE_URL, { params: query });
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getRecipeById(id) {
  try {
    const response = await httpClient.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function createRecipe(payload) {
  try {
    const normalized = await normalizeRecipePayload(payload);
    const response = await httpClient.post(RESOURCE_URL, normalized);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function updateRecipe(id, payload) {
  try {
    const normalized = await normalizeRecipePayload(payload);
    const response = await httpClient.put(`${RESOURCE_URL}/${id}`, normalized);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function patchRecipe(id, payload) {
  try {
    const existing = await getRecipeById(id);
    const merged = {
      ...existing,
      ...payload,
      details: {
        ...existing.details,
        ...payload.details,
      },
    };
    const normalized = await normalizeRecipePayload(merged);
    const response = await httpClient.put(`${RESOURCE_URL}/${id}`, normalized);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function deleteRecipe(id) {
  try {
    await httpClient.delete(`${RESOURCE_URL}/${id}`);
    return { success: true };
  } catch (error) {
    throw toServiceError(error);
  }
}

async function normalizeRecipePayload(payload) {
  const clonedPayload = JSON.parse(JSON.stringify(payload || {}));
  const incomingTags = [...(clonedPayload.details?.tags || []), "video"];
  const hasReservedTag = incomingTags.some(
    (tag) =>
      typeof tag === "string" &&
      tag.trim().toLowerCase() === RESERVED_VIDEO_TAG,
  );

  if (hasReservedTag) {
    const error = new Error(
      `"${RESERVED_VIDEO_TAG}" is a reserved tag and cannot be set manually`,
    );
    error.status = 400;
    throw error;
  }

  const normalizedTags = incomingTags
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  const hasVideo =
    typeof clonedPayload.video === "string" &&
    clonedPayload.video.trim() !== "";
  if (hasVideo) {
    normalizedTags.push(RESERVED_VIDEO_TAG);
    await ensureReservedVideoTagExists();
  }

  const uniqueTags = [...new Set(normalizedTags)].sort((a, b) =>
    a.localeCompare(b),
  );
  clonedPayload.details = {
    ...(clonedPayload.details || {}),
    tags: uniqueTags,
  };

  return clonedPayload;
}

async function ensureReservedVideoTagExists() {
  const response = await httpClient.get("/tags", {
    params: { name: RESERVED_VIDEO_TAG },
  });
  const hasVideoTag = Array.isArray(response.data) && response.data.length > 0;

  if (!hasVideoTag) {
    await httpClient.post("/tags", { name: RESERVED_VIDEO_TAG });
  }
}
