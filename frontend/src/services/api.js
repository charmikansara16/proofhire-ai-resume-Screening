// ProofHire API Client Service

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getAuthToken() {
  return localStorage.getItem('proofhire_token') || '';
}

export function setAuthSession(token, user) {
  localStorage.setItem('proofhire_token', token);
  localStorage.setItem('proofhire_user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('proofhire_token');
  localStorage.removeItem('proofhire_user');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('proofhire_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if FormData is being sent
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `HTTP error ${response.status}`);
  }

  // Return json or blob based on response
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
    return response.blob();
  }
  return response.json();
}

// --- Auth Endpoints ---
export async function registerCandidate(email, password, fullName) {
  const data = await request('/api/auth/register-candidate', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName })
  });
  setAuthSession(data.access_token, data.user);
  return data.user;
}

export async function registerRecruiter(email, password, fullName, organizationName) {
  const data = await request('/api/auth/register-recruiter', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName, organization_name: organizationName })
  });
  setAuthSession(data.access_token, data.user);
  return data.user;
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAuthSession(data.access_token, data.user);
  return data.user;
}

export async function getProfile() {
  return request('/api/auth/me');
}

// --- Candidate Endpoints ---
export async function analyzeResume(formData) {
  return request('/api/candidate/analyze', {
    method: 'POST',
    body: formData
  });
}

export async function getCandidateApplications() {
  return request('/api/candidate/applications');
}

export function getCandidatePdfUrl(appId) {
  return `${API_BASE}/api/candidate/applications/${appId}/pdf`;
}

// --- Job Endpoints ---
export async function getJobs(organizationId = null, category = null) {
  let query = [];
  if (organizationId) query.push(`organization_id=${organizationId}`);
  if (category) query.push(`category=${encodeURIComponent(category)}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  return request(`/api/jobs${qs}`);
}

export async function createJob(jobData) {
  return request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  });
}

// --- Recruiter Endpoints ---
export async function getRecruiterDashboard() {
  return request('/api/recruiter/dashboard');
}

export async function getRecruiterCandidates(jobId = null, decision = null) {
  let query = [];
  if (jobId) query.push(`job_id=${jobId}`);
  if (decision) query.push(`decision=${decision}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  return request(`/api/recruiter/candidates${qs}`);
}

export async function uploadCandidateForJob(formData) {
  return request('/api/recruiter/candidates/upload', {
    method: 'POST',
    body: formData
  });
}

export async function updateRecruiterDecision(appId, decision, notes = '') {
  return request(`/api/recruiter/candidates/${appId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision, notes })
  });
}

export function getRecruiterReportUrl(jobId) {
  return `${API_BASE}/api/recruiter/jobs/${jobId}/report`;
}
