import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    const [guestCart, setGuestCart] = useState([]);

    useEffect(() => {
        // Initialize from local storage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const storedGuestCart = localStorage.getItem('guestCart');
        
        if (storedGuestCart) {
            try {
                setGuestCart(JSON.parse(storedGuestCart));
            } catch (e) {
                console.error("Failed to parse guest cart", e);
                localStorage.removeItem('guestCart');
            }
        }
        
        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchCartCount(token);
            } catch (error) {
                console.error("Failed to parse user data", error);
                logout();
            }
        } else if (storedGuestCart) {
             // If no user, set count from guest cart
             try {
                const gc = JSON.parse(storedGuestCart);
                setCartCount(gc.length);
             } catch(e) {}
        }
        setLoading(false);
    }, []);

    const fetchCartCount = async (token) => {
        if (token) {
            try {
                const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.cart && Array.isArray(data.cart)) {
                        setCartCount(data.cart.length);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch cart count", error);
            }
        } else {
            // Guest count
            const gc = JSON.parse(localStorage.getItem('guestCart') || '[]');
            setCartCount(gc.length);
        }
    };

    const addToGuestCart = (newItem) => {
        // newItem: { productId: "...", quantity: 1 } or { packageId: "...", quantity: 1 }
        const currentCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        
        // Check if item exists to update quantity ?? 
        // Logic: Usually add to cart merges. 
        // Let's check for existing item
        const existingIndex = currentCart.findIndex(item => 
            (item.productId && item.productId === newItem.productId) || 
            (item.packageId && item.packageId === newItem.packageId)
        );

        let updatedCart;
        if (existingIndex >= 0) {
            updatedCart = [...currentCart];
            updatedCart[existingIndex].quantity += newItem.quantity;
        } else {
            updatedCart = [...currentCart, newItem];
        }

        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setGuestCart(updatedCart);
        setCartCount(updatedCart.length);
    };

    const updateGuestCartItem = (itemId, newQuantity, isPackage = false) => {
        const currentCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const updatedCart = currentCart.map(item => {
            // Match by proper ID
            const isMatch = isPackage 
                ? item.packageId === itemId 
                : item.productId === itemId;
                
            if (isMatch) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setGuestCart(updatedCart);
        // Count remains same (number of rows)
    };

    const removeFromGuestCart = (itemId, isPackage = false) => {
        const currentCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const updatedCart = currentCart.filter(item => {
             const isMatch = isPackage 
                ? item.packageId === itemId 
                : item.productId === itemId;
            return !isMatch;
        });
        
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setGuestCart(updatedCart);
        setCartCount(updatedCart.length);
    };

    const clearGuestCart = () => {
        localStorage.removeItem('guestCart');
        setGuestCart([]);
        setCartCount(0);
    };

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
        // Optionally restore guest cart count if exists?
        // usually logout means fresh start.
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading, 
            cartCount, 
            fetchCartCount,
            guestCart,
            addToGuestCart,
            updateGuestCartItem,
            removeFromGuestCart,
            clearGuestCart 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
