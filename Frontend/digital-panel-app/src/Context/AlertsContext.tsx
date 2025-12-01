import { createContext, useContext, useState, type ReactNode } from "react";

interface AlertsContextType {
    alertsNumber: number;                        // number
    setAlertsNumber: (value: number) => void;    // function that receives number
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
    const [alertsNumber, setAlertsNumber] = useState<number>(0);

    return (
        <AlertsContext.Provider value={{ alertsNumber, setAlertsNumber }}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error("useAlerts must be used within AlertsProvider");
    }
    return context;
};
