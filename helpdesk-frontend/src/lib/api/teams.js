import { apiClient } from './client';

/** Fetch teams for the public ticket-creation form (no special permission needed). */
export async function getTeamsPublic() {
  return apiClient('/teams/public');
}

/** Fetch all support teams (with members and routing rules). */
export async function getTeams() {
  return apiClient('/teams');
}

/** Create a team. */
export async function createTeam(data) {
  return apiClient('/teams', { method: 'POST', body: JSON.stringify(data) });
}

/** Update a team's name/description/default flag. */
export async function updateTeam(id, data) {
  return apiClient(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/** Add an agent to a team. */
export async function addTeamMember(teamId, userId) {
  return apiClient(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ userId }) });
}

/** Remove an agent from a team. */
export async function removeTeamMember(teamId, userId) {
  return apiClient(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
}

/** Add a routing rule (category) to a team. */
export async function addRoutingRule(teamId, category) {
  return apiClient(`/teams/${teamId}/routing-rules`, { method: 'POST', body: JSON.stringify({ category }) });
}

/** Remove a routing rule from a team. */
export async function removeRoutingRule(teamId, category) {
  return apiClient(`/teams/${teamId}/routing-rules/${category}`, { method: 'DELETE' });
}