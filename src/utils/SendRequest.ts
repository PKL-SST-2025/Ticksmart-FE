/**
 * @file sendRequest.ts
 * @description A centralized utility for making API requests.
 * It automatically handles fetching a fresh CSRF token for every secure request
 * and relies on the browser to manage HttpOnly authentication cookies.
 */

// --- Type Definitions (Unchanged) ---
interface ApiResponse<T> {
  status: 'success';
  data: T;
}
interface ApiErrorResponse {
  error: string | object;
}

// --- Helper function to fetch a fresh CSRF token ---
// This is now a simple, self-contained function.
const getCsrfToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/csrf/token', {
      method: 'GET',
      credentials: 'include', // Crucial for sending the session cookie
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.csrf_token) {
      throw new Error('CSRF token not found in response from server.');
    }
    
    return data.csrf_token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * The main exported function to interact with the backend API.
 *
 * @template T The expected type of the JSON response data.
 * @param path The API endpoint path (e.g., '/auth/login').
 * @param options The request options (method, body, headers).
 * @returns A promise that resolves with the response data.
 */
export const sendRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const method = options.method || 'GET';
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  const allHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  let bodyPayload: any = options.body;

  if (stateChangingMethods.includes(method)) {
    const csrfToken = await getCsrfToken();
    // Pass CSRF token in header
    allHeaders['X-CSRF-Token'] = csrfToken;
    // Also include CSRF token in body (if body is JSON)
    bodyPayload = {
      ...((options.body as object) || {}),
      csrf_token: csrfToken,
    };
  }

  const requestOptions: RequestInit = {
    method,
    headers: allHeaders,
    credentials: 'include',
    body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
  };

  try {
    const response = await fetch(`/api${path}`, requestOptions);

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({ error: response.statusText }));
      if (typeof errorData.error === 'string') throw new Error(errorData.error);
      if (typeof errorData.error === 'object') throw errorData.error;
      throw new Error('An unknown API error occurred');
    }

    const responseText = await response.text();
    return responseText ? (JSON.parse(responseText) as T) : ({} as T);

  } catch (error) {
    throw error;
  }
};
