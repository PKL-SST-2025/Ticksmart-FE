/**
 * @file SendRequest.ts
 * @description A centralized and robust utility for making API requests.
 * It automatically handles CSRF token fetching and inclusion for secure requests.
 */

// A module-level variable to cache the CSRF token.
// This prevents us from having to fetch it before every single request.
let csrfToken: string | null = null;

let authToken: string | null = null;

/**
 * Fetches the CSRF token from the API and caches it.
 * This is called automatically by `sendRequest` when needed.
 * @throws {Error} If the network request to fetch the token fails.
 */
const getCsrfToken = async (): Promise<void> => {
  try {
    // The credentials 'include' is crucial. It tells the browser to send
    // the session cookie to the backend, which is required for CSRF protection.
    const response = await fetch('/api/csrf/token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("CSRF Response", data)
    if (!data.csrf_token) { 
      throw new Error('CSRF token not found in response from server.');
    }

    console.log('CSRF Token obtained successfully.');
    csrfToken = data.csrf_token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Re-throw the error to ensure the original request that triggered this also fails.
    throw error;
  }

  
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch auth token. Status: ${response.status}`);
    }

    const data = await response.text();
    authToken = data;
    return data;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    return null;
    // Re-throw the error to ensure the original request that triggered this also fails.
  }

  
};

/**
 * Defines the options for our sendRequest function.
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}


/**
 * The main exported function to interact with the backend API.
 * 
 * It automatically handles:
 *  - Prepending '/api' to the path.
 *  - Setting correct JSON headers.
 *  - Fetching and including the CSRF token for methods that require it.
 *  - Sending cookies and credentials.
 *  - Parsing JSON responses and handling API errors gracefully.
 *
 * @template T The expected type of the JSON response data.
 * @param {string} path The API endpoint path (e.g., '/auth/login').
 * @param {RequestOptions} [options={}] The request options (method, body, headers).
 * @returns {Promise<T>} A promise that resolves with the response data.
 * @throws {Error} If the request fails due to network issues or an API error.
 */

export const sendRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const method = options.method || 'GET';
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (stateChangingMethods.includes(method) && !csrfToken) {
    await getCsrfToken();
  }

  if (!authToken && path !== "/auth/login" && path !== "/auth/register") {
    await getAuthToken();
  }

  const allHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  if (authToken && path !== "/auth/login" && path !== "/auth/register") {
    allHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  let requestBody: string | undefined;

  if (stateChangingMethods.includes(method)) {
    if (Array.isArray(options.body)) {
      requestBody = JSON.stringify(options.body);
      allHeaders['X-CSRF-Token'] = csrfToken || '';
    } else {
      const bodyWithCsrf = {
        ...(options.body as object || {}),
        csrf_token: csrfToken,
      };
      requestBody = JSON.stringify(bodyWithCsrf);
    }
  } else if (options.body) {
    requestBody = JSON.stringify(options.body);
  } else {
    requestBody = undefined;
  }

  const requestOptions: RequestInit = {
    method,
    headers: allHeaders,
    credentials: 'include',
    body: requestBody,
  };

  try {
    const response = await fetch(`/api${path}`, requestOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(
        `API Error: ${response.status} - ${errorData.message || 'Unknown error'}`
      );
    }

    // --- FIX: Robustly handle empty response bodies ---
    // The most reliable way is to read the response as text first.
    // response.text() can handle empty bodies gracefully, response.json() cannot.
    const responseText = await response.text();

    // If the response text is empty (common for 204 No Content, or successful 200/201
    // with no body), return an empty object to satisfy the Promise<T> return type
    // without causing a JSON parsing error.
    if (responseText.length === 0) {
      return {} as T;
    }

    // If there is text, it's now safe to parse it as JSON.
    try {
      return JSON.parse(responseText) as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText);
      // This indicates the server sent a non-JSON body on a successful request.
      // Re-throw the original JSON parsing error.
      throw e;
    }
    // --- END FIX ---

  } catch (error) {
    console.error(`Request to '${path}' failed:`, error);
    throw error;
  }
};