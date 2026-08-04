import { apiClient } from './client'

export async function getClassifications() {
  return apiClient('/classification')
}

export async function createClassification(data) {
  return apiClient('/classification', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateClassification(id, data) {
  return apiClient(`/classification/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteClassification(id) {
  return apiClient(`/classification/${id}`, {
    method: 'DELETE'
  })
}
