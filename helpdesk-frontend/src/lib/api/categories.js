import { apiClient } from './client'

const LEGACY_CATEGORY_ROUTE = '/category'
const CATEGORY_ROUTE = '/categories'

function shouldFallback(error) {
  return error?.message?.includes('No static resource categories')
}

export async function getCategories() {
  try {
    return await apiClient(CATEGORY_ROUTE)
  } catch (error) {
    if (shouldFallback(error)) {
      return apiClient(LEGACY_CATEGORY_ROUTE)
    }
    throw error
  }
}

export async function createCategory(data) {
  try {
    return await apiClient(CATEGORY_ROUTE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  } catch (error) {
    if (shouldFallback(error)) {
      return apiClient(LEGACY_CATEGORY_ROUTE, {
        method: 'POST',
        body: JSON.stringify(data)
      })
    }
    throw error
  }
}

export async function updateCategory(id, data) {
  try {
    return await apiClient(`${CATEGORY_ROUTE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  } catch (error) {
    if (shouldFallback(error)) {
      return apiClient(`${LEGACY_CATEGORY_ROUTE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    }
    throw error
  }
}

export async function deleteCategory(id) {
  try {
    return await apiClient(`${CATEGORY_ROUTE}/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    if (shouldFallback(error)) {
      return apiClient(`${LEGACY_CATEGORY_ROUTE}/${id}`, {
        method: 'DELETE'
      })
    }
    throw error
  }
}
