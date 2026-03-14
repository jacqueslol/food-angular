import {
  createMealplannerEntry,
  deleteMealplannerEntry,
  getMealplannerEntryById,
  listMealplannerEntries,
  patchMealplannerEntry,
  updateMealplannerEntry
} from "../services/mealplanner.service.js";

function parseId(idParam) {
  if (!idParam) {
    const error = new Error("Missing id parameter");
    error.status = 400;
    throw error;
  }
  return idParam;
}

function sendError(res, error) {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "Internal server error",
    details: error.details || null
  });
}

export async function getMealplanner(req, res) {
  try {
    const entries = await listMealplannerEntries(req.query);
    res.json(entries);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMealplannerEntry(req, res) {
  try {
    const id = parseId(req.params.id);
    const entry = await getMealplannerEntryById(id);
    res.json(entry);
  } catch (error) {
    sendError(res, error);
  }
}

export async function postMealplannerEntry(req, res) {
  try {
    const created = await createMealplannerEntry(req.body);
    res.status(201).json(created);
  } catch (error) {
    sendError(res, error);
  }
}

export async function putMealplannerEntry(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await updateMealplannerEntry(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function patchMealplannerById(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await patchMealplannerEntry(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function removeMealplannerEntry(req, res) {
  try {
    const id = parseId(req.params.id);
    await deleteMealplannerEntry(id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
