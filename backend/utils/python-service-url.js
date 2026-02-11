const DEFAULT_PYTHON_SERVICE_BASE_URL = 'http://127.0.0.1:5001';
const DEFAULT_PYTHON_SERVICE_URL = `${DEFAULT_PYTHON_SERVICE_BASE_URL}/detect`;

const PYTHON_SERVICE_ENDPOINT_SUFFIX_REGEX = /\/(detect|health|classes)$/;

const buildPythonServiceUrl = (endpointPath) => {
  const configuredUrl = (process.env.PYTHON_SERVICE_URL || DEFAULT_PYTHON_SERVICE_URL).trim();
  const normalizedEndpointPath = endpointPath.startsWith('/')
    ? endpointPath
    : `/${endpointPath}`;

  try {
    const parsedUrl = new URL(configuredUrl);
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, '');
    const basePath = PYTHON_SERVICE_ENDPOINT_SUFFIX_REGEX.test(normalizedPath)
      ? normalizedPath.replace(PYTHON_SERVICE_ENDPOINT_SUFFIX_REGEX, '')
      : normalizedPath;

    parsedUrl.pathname = `${basePath}${normalizedEndpointPath}`.replace(/\/+/g, '/');
    parsedUrl.search = '';
    parsedUrl.hash = '';

    return parsedUrl.toString();
  } catch (_error) {
    return `${DEFAULT_PYTHON_SERVICE_BASE_URL}${normalizedEndpointPath}`;
  }
};

module.exports = {
  buildPythonServiceUrl,
};
