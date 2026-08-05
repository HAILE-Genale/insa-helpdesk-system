const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085/api';

export async function apiClient(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Inject JWT Authorization header (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('insa_helpdesk_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // On 401/403, clear auth state and redirect to login (client-side only)
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('insa_helpdesk_token');
      localStorage.removeItem('insa_helpdesk_user');
      document.cookie = 'insa_helpdesk_user=; Path=/; Max-Age=0; SameSite=Lax';
      window.location.href = '/login';
    }
    throw new Error(`API Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    let errorMsg = `API Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMsg = errorData.message;
      } else if (errorData && errorData.error) {
        errorMsg = errorData.error;
      }
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
