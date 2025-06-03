import { createContext, useContext, useState } from "react";

export const HoopsContext = createContext();

export function useHoopsContext() {
    return useContext(HoopsContext);
}

export default function HoopsProvider({ children }) {

    const [selectedNodeIds, setSelectedNodeIds] = useState([])

    return (
        <HoopsContext.Provider value={{ selectedNodeIds, setSelectedNodeIds }}>
            {children}
        </HoopsContext.Provider>
    );
}

