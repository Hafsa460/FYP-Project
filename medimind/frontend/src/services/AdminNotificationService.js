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
    const adminName = localStorage.getItem("name") || localStorage.getItem("adminName") || null;
    const notification = {
      id: Date.now(),
      message,
      type,
      adminId,
      adminName,
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
      const adminName = localStorage.getItem("name") || localStorage.getItem("adminName") || null;
      const filtered = stored.filter(n => n.adminId === adminId).map((notif) => {
        if (adminName && notif.message && notif.message.includes(` by admin ${adminId}`)) {
          return {
            ...notif,
            message: notif.message.replace(` by admin ${adminId}`, ` by admin ${adminName}`),
            adminName,
          };
        }
        return notif;
      });
      // Save normalized notifications back to localStorage so old admin ID messages are fixed
      const normalized = stored.map((notif) => {
        if (notif.adminId === adminId && adminName && notif.message && notif.message.includes(` by admin ${adminId}`)) {
          return {
            ...notif,
            message: notif.message.replace(` by admin ${adminId}`, ` by admin ${adminName}`),
            adminName,
          };
        }
        return notif;
      });
      localStorage.setItem("adminNotifications", JSON.stringify(normalized));
      return filtered;
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
  notifyDoctorAdded(adminId, adminName, doctorName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Doctor added: ${doctorName} by admin ${displayName}`, "action", adminId);
  }

  notifyPatientAdded(adminId, adminName, patientName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Patient added: ${patientName} by admin ${displayName}`, "action", adminId);
  }

  notifyDepartmentAdded(adminId, adminName, departmentName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Department added: ${departmentName} by admin ${displayName}`, "action", adminId);
  }

  notifyDoctorUpdated(adminId, adminName, doctorName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Doctor updated: ${doctorName} by admin ${displayName}`, "action", adminId);
  }

  notifyPatientUpdated(adminId, adminName, patientName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Patient updated: ${patientName} by admin ${displayName}`, "action", adminId);
  }

  notifyDepartmentUpdated(adminId, adminName, departmentName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Department updated: ${departmentName} by admin ${displayName}`, "action", adminId);
  }

  notifyDoctorDeleted(adminId, adminName, doctorName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Doctor deleted: ${doctorName} by admin ${displayName}`, "action", adminId);
  }

  notifyPatientDeleted(adminId, adminName, patientName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Patient deleted: ${patientName} by admin ${displayName}`, "action", adminId);
  }

  notifyDepartmentDeleted(adminId, adminName, departmentName) {
    const displayName = adminName || localStorage.getItem("name") || "Unknown";
    this.notify(`Department deleted: ${departmentName} by admin ${displayName}`, "action", adminId);
  }
}

// Create a singleton instance
const adminNotificationService = new AdminNotificationService();

export default adminNotificationService;
