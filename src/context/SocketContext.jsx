import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            const newSocket = io("http://localhost:5000");
            setSocket(newSocket);

            newSocket.emit("join", user._id);

            newSocket.on("newNotification", (notification) => {
                toast.success(notification.title, {
                    description: notification.message,
                    icon: "🔔"
                });
            });

            newSocket.on("courseLaunched", (data) => {
                toast.success(data.title, {
                    description: data.message,
                    icon: "🚀"
                });
            });

            return () => newSocket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
