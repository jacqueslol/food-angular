import {
  createTag,
  deleteTag,
  getTagById,
  listTags,
  patchTag,
  updateTag
} from "../services/tags.service.js";

function parseId(idParam) {
  const parsedId = Number(idParam);
  if (Number.isNaN(parsedId)) {
    const error = new Error("Invalid id parameter");
    error.status = 400;
    throw error;
  }
  return parsedId;
}

function sendError(res, error) {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "Internal server error",
    details: error.details || null
  });
}

export async function getTags(req, res) {
  try {
    const tags = await listTags(req.query);
    res.json(tags);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getTag(req, res) {
  try {
    const id = parseId(req.params.id);
    const tag = await getTagById(id);
    res.json(tag);
  } catch (error) {
    sendError(res, error);
  }
}

export async function postTag(req, res) {
  try {
    const created = await createTag(req.body);
    res.status(201).json(created);
  } catch (error) {
    sendError(res, error);
  }
}

export async function putTag(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await updateTag(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function patchTagById(req, res) {
  try {
    const id = parseId(req.params.id);
    const updated = await patchTag(id, req.body);
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
}

export async function removeTag(req, res) {
  try {
    const id = parseId(req.params.id);
    await deleteTag(id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
