// AdminNotificationService.js - Service to manage admin action notifications

class AdminNotificationService {
  constructor() {
    this.listeners = [];
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify listeners of a new action
  notify(message, type = "action", adminId = null) {
    const notification = {
      id: Date.now(),
      message,
      type,
      adminId,
      timestamp: new Date(),
    };

    // Notify all listeners
    this.listeners.forEach(callback => callback(notification));

    // Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      stored.push(notification);
      // Keep only last 50 notifications
      if (stored.length > 50) {
        stored.shift();
      }
      localStorage.setItem("adminNotifications", JSON.stringify(stored));
    } catch (err) {
      console.error("Error storing notification:", err);
    }
  }

  // Get stored notifications for current admin
  getStoredNotifications(adminId) {
    try {
      const stored = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      // Return only notifications for this admin
      return stored.filter(n => n.adminId === adminId);
    } catch (err) {
      console.error("Error retrieving notifications:", err);
      return [];
    }
  }

  // Clear all notifications for current admin
  clearNotifications(adminId) {
    try {
      const stored = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      const filtered = stored.filter(n => n.adminId !== adminId);
      localStorage.setItem("adminNotifications", JSON.stringify(filtered));
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  }

  // Common notification helpers
  notifyDoctorAdded(adminId, doctorName) {
    this.notify(`Doctor added: ${doctorName} by admin ${adminId}`, "action", adminId);
  }

  notifyPatientAdded(adminId, patientName) {
    this.notify(`Patient added: ${patientName} by admin ${adminId}`, "action", adminId);
  }

  notifyDepartmentAdded(adminId, departmentName) {
    this.notify(`Department added: ${departmentName} by admin ${adminId}`, "action", adminId);
  }

  notifyDoctorUpdated(adminId, doctorName) {
    this.notify(`Doctor updated: ${doctorName} by admin ${adminId}`, "action", adminId);
  }

  notifyPatientUpdated(adminId, patientName) {
    this.notify(`Patient updated: ${patientName} by admin ${adminId}`, "action", adminId);
  }

  notifyDepartmentUpdated(adminId, departmentName) {
    this.notify(`Department updated: ${departmentName} by admin ${adminId}`, "action", adminId);
  }

  notifyDoctorDeleted(adminId, doctorName) {
    this.notify(`Doctor deleted: ${doctorName} by admin ${adminId}`, "action", adminId);
  }

  notifyPatientDeleted(adminId, patientName) {
    this.notify(`Patient deleted: ${patientName} by admin ${adminId}`, "action", adminId);
  }

  notifyDepartmentDeleted(adminId, departmentName) {
    this.notify(`Department deleted: ${departmentName} by admin ${adminId}`, "action", adminId);
  }
}

// Create a singleton instance
const adminNotificationService = new AdminNotificationService();

export default adminNotificationService;
