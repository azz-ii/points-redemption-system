import { X, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  // Dummy notification data
  const notifications: Notification[] = [
    {
      id: "1",
      type: "success",
      title: "Request Approved",
      message: "Your redemption request #SA220011 has been approved.",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "New Item Added",
      message: "Platinum Polo has been added to the catalogue.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Low Stock Alert",
      message: "Corporate Tie inventory is running low.",
      time: "2 hours ago",
      read: true,
    },
    {
      id: "4",
      type: "success",
      title: "Account Created",
      message: "New account for Raham has been created successfully.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: "5",
      type: "error",
      title: "Request Rejected",
      message: "Redemption request #SA220015 has been rejected.",
      time: "5 hours ago",
      read: true,
    },
    {
      id: "6",
      type: "info",
      title: "System Update",
      message: "The system will undergo maintenance tonight at 10 PM.",
      time: "1 day ago",
      read: true,
    },
  ];

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } bg-card text-card-foreground shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Info className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-accent ${
                    !notification.read ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="shrink-0 w-2 h-2 bg-foreground rounded-full mt-1" />
                        )}
                      </div>
                      <p className="text-sm mb-2 text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
