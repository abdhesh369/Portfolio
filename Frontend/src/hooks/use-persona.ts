import { useState, useEffect } from "react";

export type Persona = 'recruiter' | 'client' | 'developer' | 'default';

export function usePersona() {
    const [persona, setPersonaState] = useState<Persona>(() => {
        if (typeof window === "undefined") return "default";
        return (localStorage.getItem("portfolio_persona") as Persona) || "default";
    });

    const [isDevMode, setIsDevMode] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("portfolio_dev_mode") === "true";
    });

    const setPersona = (newPersona: Persona) => {
        setPersonaState(newPersona);
        localStorage.setItem("portfolio_persona", newPersona);
    };

    const toggleDevMode = (enabled?: boolean) => {
        const newState = enabled !== undefined ? enabled : !isDevMode;
        setIsDevMode(newState);
        localStorage.setItem("portfolio_dev_mode", String(newState));
        
        // When dev mode is toggled, also switch to developer persona
        if (newState) {
            setPersona('developer');
        }
    };

    // Reflect dev mode in body class for global styling
    useEffect(() => {
        if (isDevMode) {
            document.body.classList.add("dev-mode-active");
        } else {
            document.body.classList.remove("dev-mode-active");
        }
    }, [isDevMode]);

    return {
        persona,
        setPersona,
        isDevMode,
        toggleDevMode
    };
}
