import { apiClient } from './client';

export async function getKnowledgeBaseArticles() {
  return apiClient('/knowledge-base');
}
