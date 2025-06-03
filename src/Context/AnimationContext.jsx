import { createContext, useContext, useState } from "react";

export const AnimationContext = createContext();

export function useAnimationContext() {
    return useContext(AnimationContext);
}

export default function AnimationProvider({ children }) {

    const [animation, setAnimation] = useState([])

    const addAnimation = (newAnimation) => {
        setAnimation((prevAnimations) => [...prevAnimations, newAnimation]);
    }

    const removeAnimation = (index) => {
        setAnimation((prevAnimations) => prevAnimations.filter((_, i) => i !== index));
    }

    const clearAnimations = () => {
        setAnimation([]);
    }

    const updateAnimation = (index, updatedAnimation) => {
        setAnimation((prevAnimations) => {
            const newAnimations = [...prevAnimations];
            newAnimations[index] = updatedAnimation;
            return newAnimations;
        });
    }

    return (
        <AnimationContext.Provider value={{ animation, addAnimation, removeAnimation, updateAnimation, clearAnimations }}>
            {children}
        </AnimationContext.Provider>
    );
}

