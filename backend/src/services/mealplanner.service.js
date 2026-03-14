import httpClient from "../utils/http-client.js";
import { toServiceError } from "../utils/service-error.js";

const RESOURCE_URL = "/mealplanner";

export async function listMealplannerEntries(query = {}) {
  try {
    const response = await httpClient.get(RESOURCE_URL, { params: query });
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getMealplannerEntryById(id) {
  try {
    const response = await httpClient.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function createMealplannerEntry(payload) {
  try {
    const response = await httpClient.post(RESOURCE_URL, payload);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function updateMealplannerEntry(id, payload) {
  try {
    const response = await httpClient.put(`${RESOURCE_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function patchMealplannerEntry(id, payload) {
  try {
    const response = await httpClient.patch(`${RESOURCE_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function deleteMealplannerEntry(id) {
  try {
    await httpClient.delete(`${RESOURCE_URL}/${id}`);
    return { success: true };
  } catch (error) {
    throw toServiceError(error);
  }
}
