import React from "react";
import { Bell } from "lucide-react";

function NotificationPanel({ notifications, userType }) {
  return (
    <div className="notification-panel p-3">
      <h5>
        <Bell className="me-2" size={18} />
        Notifications
      </h5>
      <ul>
        {notifications && notifications.length > 0 ? (
          notifications.slice(0, 10).map((notif, index) => (
            <li key={index}>
              {notif}
            </li>
          ))
        ) : (
          <li>No new notifications</li>
        )}
      </ul>
    </div>
  );
}

export default NotificationPanel;