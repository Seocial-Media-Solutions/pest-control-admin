import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Reset search query on route change to prevent stale searches on new pages
    useEffect(() => {
        setSearchQuery('');
    }, [location.pathname]);

    const value = {
        searchQuery,
        setSearchQuery,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};
