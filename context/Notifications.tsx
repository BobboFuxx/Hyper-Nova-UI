import { createContext, useContext } from "react";
import { toast } from "react-hot-toast";

const NotificationsContext = createContext({
  notify: (message: string, type?: "success" | "error" | "info") => {}
});

export const NotificationsProvider = ({ children }: any) => {
  const notify = (message: string, type: "success" | "error" | "info" = "info") => {
    toast(message, { type });
  };
  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
