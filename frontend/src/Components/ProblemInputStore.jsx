import React, { createContext, useContext, useState } from "react";

const ProblemContext = createContext();

export const ProblemStoreProvider = ({ children }) => {
    const [tags, setTags] = useState([]);
    const [images, setImages] = useState([]);
    const [hints, setHints] = useState([]);

    return (
        <ProblemContext.Provider value={{ tags, setTags, images, setImages, hints, setHints }}>
            {children}
        </ProblemContext.Provider>
    );
};

export const useProblemStore = () => useContext(ProblemContext);
