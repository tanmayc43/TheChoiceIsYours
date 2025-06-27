class StatsTracker {
  constructor() {
    this.sessionId = this.getSessionId();
    this.currentPage = window.location.pathname;
    this.startTime = Date.now();
    this.pageStartTime = Date.now();
    this.isTracking = false;
    this.apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    this.init();
  }

  getSessionId() {
    let sessionId = localStorage.getItem('stats_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('stats_session_id', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async init() {
    // Track initial page visit
    await this.trackVisit();
    
    // Set up page visibility tracking
    this.setupVisibilityTracking();
    
    // Set up navigation tracking
    this.setupNavigationTracking();
    
    // Set up periodic duration updates
    this.setupDurationTracking();
    
    // Set up beforeunload tracking
    this.setupBeforeUnloadTracking();
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden, update duration
        this.updateDuration();
      } else {
        // Page visible again, reset start time
        this.pageStartTime = Date.now();
      }
    });
  }

  setupNavigationTracking() {
    // Track navigation using History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.handlePageChange();
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.handlePageChange();
      return originalReplaceState.apply(history, args);
    };

    window.addEventListener('popstate', () => {
      this.handlePageChange();
    });
  }

  setupDurationTracking() {
    // Update duration every 30 seconds
    setInterval(() => {
      if (!document.hidden) {
        this.updateDuration();
      }
    }, 30000);
  }

  setupBeforeUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      this.updateDuration();
      // Send final update synchronously
      this.sendBeacon('/stats/update-duration', {
        sessionId: this.sessionId,
        pageName: this.currentPage,
        timeSpent: Date.now() - this.pageStartTime
      });
    });
  }

  async handlePageChange() {
    // Update duration for previous page
    await this.updateDuration();
    
    // Update current page
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();
    
    // Track new page visit
    await this.trackVisit();
  }

  async trackVisit() {
    try {
      const response = await fetch(`${this.apiBase}/stats/track-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          pageName: this.currentPage,
          referrer: document.referrer,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        })
      });

      if (!response.ok) {
        console.warn('Failed to track visit');
      }
    } catch (error) {
      console.warn('Error tracking visit:', error);
    }
  }

  async trackAction(actionType, actionData = {}) {
    try {
      const response = await fetch(`${this.apiBase}/stats/track-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          actionType,
          actionData,
          pageName: this.currentPage
        })
      });

      if (!response.ok) {
        console.warn('Failed to track action');
      }
    } catch (error) {
      console.warn('Error tracking action:', error);
    }
  }

  async updateDuration() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    
    try {
      const timeSpent = Date.now() - this.pageStartTime;
      
      const response = await fetch(`${this.apiBase}/stats/update-duration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          pageName: this.currentPage,
          timeSpent
        })
      });

      if (response.ok) {
        this.pageStartTime = Date.now();
      }
    } catch (error) {
      console.warn('Error updating duration:', error);
    } finally {
      this.isTracking = false;
    }
  }

  sendBeacon(endpoint, data) {
    if (navigator.sendBeacon) {
      const url = `${this.apiBase}${endpoint}`;
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });
      navigator.sendBeacon(url, blob);
    }
  }

  // Convenience methods for common actions
  trackButtonClick(buttonName, additionalData = {}) {
    this.trackAction('button_click', {
      button: buttonName,
      ...additionalData
    });
  }

  trackFormSubmit(formName, additionalData = {}) {
    this.trackAction('form_submit', {
      form: formName,
      ...additionalData
    });
  }

  trackLinkClick(linkText, linkUrl, additionalData = {}) {
    this.trackAction('link_click', {
      linkText,
      linkUrl,
      ...additionalData
    });
  }

  trackScroll(depth, additionalData = {}) {
    this.trackAction('scroll', {
      depth,
      ...additionalData
    });
  }

  trackError(errorMessage, errorStack, additionalData = {}) {
    this.trackAction('error', {
      errorMessage,
      errorStack,
      ...additionalData
    });
  }

  trackCustomEvent(eventName, eventData = {}) {
    this.trackAction('custom_event', {
      eventName,
      ...eventData
    });
  }
}

// Create and export a singleton instance
const statsTracker = new StatsTracker();

export default statsTracker; 