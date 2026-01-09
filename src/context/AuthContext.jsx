import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async (token) => {
        if (!token) return;
        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Cart count is the number of unique items (keys in cart object or rows in cart array)
                // Assuming data.cart is an array of items based on request description
                if (data.cart && Array.isArray(data.cart)) {
                    setCartCount(data.cart.length);
                }
            }
        } catch (error) {
            console.error("Failed to fetch cart count", error);
        }
    };

    useEffect(() => {
        // Initialize from local storage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchCartCount(token);
            } catch (error) {
                console.error("Failed to parse user data", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Double safety: Remove password if it somehow got here
        const safeUser = { ...userData };
        delete safeUser.password;
        delete safeUser.confirmPassword;

        setUser(safeUser);
        localStorage.setItem('user', JSON.stringify(safeUser));
        localStorage.setItem('token', token);
        fetchCartCount(token);
    };

    const logout = () => {
        setUser(null);
        setCartCount(0);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, cartCount, fetchCartCount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
