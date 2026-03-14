export function toServiceError(error) {
  if (error?.status) {
    const serviceError = new Error(error.message || "Service request failed");
    serviceError.status = error.status;
    serviceError.details = error.details || null;
    return serviceError;
  }

  if (error.response) {
    const serviceError = new Error(
      error.response.data?.message || "Upstream service request failed"
    );
    serviceError.status = error.response.status;
    serviceError.details = error.response.data;
    return serviceError;
  }

  const fallbackError = new Error(error.message || "Internal service error");
  fallbackError.status = 500;
  return fallbackError;
}
