const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    // Mirror into a cookie so the Edge middleware can read it.
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=604800`;
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    // Clear the middleware cookie as well.
    document.cookie = 'auth_token=; path=/; SameSite=Strict; max-age=0';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async logout() {
    this.clearToken();
  }

  // Wedding settings
  async getWeddingSettings() {
    return this.request('/wedding');
  }

  async updateWeddingSettings(settings: any) {
    return this.request('/wedding', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async uploadWeddingImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request<{ filename: string }>('/wedding/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Timeline
  async getTimeline() {
    return this.request('/timeline');
  }

  async createTimelineEvent(event: any) {
    return this.request('/timeline', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateTimelineEvent(id: string, event: any) {
    return this.request(`/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteTimelineEvent(id: string) {
    return this.request(`/timeline/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedule
  async getSchedule() {
    return this.request('/schedule');
  }

  async createScheduleEvent(event: any) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateScheduleEvent(id: string, event: any) {
    return this.request(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteScheduleEvent(id: string) {
    return this.request(`/schedule/${id}`, {
      method: 'DELETE',
    });
  }

  // Gallery
  async getGallery() {
    return this.request('/gallery');
  }

  async uploadGalleryImage(file: File, caption?: string, sortOrder?: number) {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) formData.append('caption', caption);
    if (sortOrder !== undefined) formData.append('sort_order', sortOrder.toString());

    return this.request('/gallery', {
      method: 'POST',
      body: formData,
    });
  }

  async updateGalleryImage(id: string, updates: any) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGalleryImage(id: string) {
    return this.request(`/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  getGalleryImageUrl(filename: string) {
    return `${API_BASE_URL}/gallery/files/${filename}`;
  }

  // RSVP
  async getRSVPs() {
    return this.request('/rsvp');
  }

  async createRSVP(rsvp: any) {
    return this.request('/rsvp', {
      method: 'POST',
      body: JSON.stringify(rsvp),
    });
  }

  async deleteRSVP(id: string) {
    return this.request(`/rsvp/${id}`, {
      method: 'DELETE',
    });
  }

  // GMS — Weddings
  async getMyWeddings() {
    return this.request<any[]>('/weddings');
  }

  async getWedding(weddingId: string) {
    return this.request<any>(`/weddings/${weddingId}`);
  }

  // GMS — Guests
  async getGuests(weddingId: string) {
    return this.request<any[]>(`/weddings/${weddingId}/guests`);
  }

  async addGuest(weddingId: string, guest: any) {
    return this.request<any>(`/weddings/${weddingId}/guests`, {
      method: 'POST',
      body: JSON.stringify(guest),
    });
  }

  async updateGuest(weddingId: string, guestId: string, updates: any) {
    return this.request<any>(`/weddings/${weddingId}/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGuest(weddingId: string, guestId: string) {
    return this.request<any>(`/weddings/${weddingId}/guests/${guestId}`, {
      method: 'DELETE',
    });
  }

  async getGuestInvitation(weddingId: string, guestId: string) {
    return this.request<any>(`/weddings/${weddingId}/guests/${guestId}/invitation`);
  }

  async getPendingChanges(weddingId: string) {
    return this.request<any[]>(`/weddings/${weddingId}/guests/pending/list`);
  }

  async reviewPendingChange(weddingId: string, changeId: string, decision: 'approved' | 'rejected') {
    return this.request<any>(`/weddings/${weddingId}/guests/pending/${changeId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
  }

  // GMS — Gate
  async checkInGuest(weddingId: string, entranceCode: string, method: 'qr_scan' | 'code_entry' = 'code_entry') {
    return this.request<any>(`/weddings/${weddingId}/gate/check-in`, {
      method: 'POST',
      body: JSON.stringify({ entrance_code: entranceCode, method }),
    });
  }

  async getGateStats(weddingId: string) {
    return this.request<any>(`/weddings/${weddingId}/gate/stats`);
  }

  async getRecentCheckIns(weddingId: string) {
    return this.request<any[]>(`/weddings/${weddingId}/gate/recent`);
  }

  // GMS — Roles
  async getWeddingRoles(weddingId: string) {
    return this.request<any[]>(`/weddings/${weddingId}/roles`);
  }

  async assignWeddingRole(weddingId: string, userId: string, role: string) {
    return this.request<any>(`/weddings/${weddingId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  async removeWeddingRole(weddingId: string, roleId: string) {
    return this.request<any>(`/weddings/${weddingId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async updateOrganizerPermissions(weddingId: string, orgUserId: string, permissions: any) {
    return this.request<any>(`/weddings/${weddingId}/roles/organizers/${orgUserId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  }

  // GMS — Media
  async submitMedia(weddingId: string, file: File, entranceCode: string, guestName?: string, caption?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entrance_code', entranceCode);
    if (guestName) formData.append('guest_name', guestName);
    if (caption) formData.append('caption', caption);
    return this.request<any>(`/weddings/${weddingId}/media/submit`, {
      method: 'POST',
      body: formData,
    });
  }

  async getMediaSubmissions(weddingId: string) {
    return this.request<any[]>(`/weddings/${weddingId}/media`);
  }

  async markMediaViewed(weddingId: string, mediaId: string) {
    return this.request<any>(`/weddings/${weddingId}/media/${mediaId}/viewed`, { method: 'POST' });
  }

  async deleteMedia(weddingId: string, mediaId: string) {
    return this.request<any>(`/weddings/${weddingId}/media/${mediaId}`, { method: 'DELETE' });
  }

  getMediaFileUrl(weddingId: string, filename: string) {
    return `${API_BASE_URL}/weddings/${weddingId}/media/files/${filename}`;
  }

  async searchUsers(email: string) {
    return this.request<any[]>(`/users/search?email=${encodeURIComponent(email)}`);
  }

  async listAllUsers() {
    return this.request<any[]>('/users');
  }

  async createUser(email: string, password: string) {
    return this.request<{ id: string; email: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export const apiClient = new ApiClient();