import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes,
  patchRecipe,
  updateRecipe
} from "../services/recipes.service.js";

function parseId(idParam) {
  if (typeof idParam !== "string" || idParam.trim() === "") {
    const error = new Error("Invalid id parameter");
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

export async function getRecipes(req, res) {
  try {
    const recipes = await listRecipes(req.query);
    res.json(recipes);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getRecipe(req, res) {
  try {
    const id = parseId(req.params.id);
    const recipe = await getRecipeById(id);
    res.json(recipe);
  } catch (error) {
    sendError(res, error);
  }
}

export async function postRecipe(req, res) {
  try {
    const created = await createRecipe(req.body);
    res.status(201).json(created);
  } catch (error) {
    sendError(res, error);
  }
}

export async function putRecipe(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await updateRecipe(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function patchRecipeById(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await patchRecipe(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function removeRecipe(req, res) {
  try {
    const id = parseId(req.params.id);
    await deleteRecipe(id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
