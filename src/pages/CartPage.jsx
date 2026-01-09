import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
    const { user, fetchCartCount } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); // ID of item being updated
    const [isClearing, setIsClearing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [cartMessage, setCartMessage] = useState(''); // New state for API messages

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setCartItems(data.cart || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching cart", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, currentQty, delta) => {
        const newQty = delta === 1 ? 1 : -1; 
        
        setProcessingId(productId);
        setCartMessage(''); // Clear previous message
        
        const url = `https://nymedbackend.vercel.app/api/cart/${productId}`;
        const body = { quantity: newQty };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            if (data.message) {
                setCartMessage(data.message);
                // Clear message after 3 seconds
                setTimeout(() => setCartMessage(''), 3000);
            }

            if (response.ok) {
               await fetchCart(); 
            } else {
                console.error("Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating quantity", error);
        } finally {
            setProcessingId(null);
        }
    };

    const removeItem = async (productId) => {
        setProcessingId(productId); 
        setCartMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://nymedbackend.vercel.app/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart(); 
                fetchCartCount(token); // Update global badge
            } else {
                console.error("Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing item", error);
        } finally {
            setProcessingId(null);
        }
    };

    const clearCart = async () => {
        setIsClearing(true);
        setCartMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart();
                fetchCartCount(token);
            }
        } catch (error) {
            console.error("Error clearing cart", error);
        } finally {
            setIsClearing(false);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setCheckoutError('');
        setCartMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/orders', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart();
                fetchCartCount(token);
                setCartMessage('Order placed successfully!');
            } else {
                const data = await response.json();
                setCheckoutError(data.message || 'Checkout failed');
            }
        } catch (error) {
            setCheckoutError(error.message || 'Checkout failed');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <Loader2 size={40} className="animate-spin" color="#D4AF37" />
                <p>Loading Cart...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Cart Empty</h2>
                <p>Add Products to fill</p>
                <button onClick={() => navigate('/shop')} className="cta-btn small">Go to Shop</button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Your Cart</h1>
                <button 
                    className="clear-cart-btn" 
                    onClick={clearCart}
                    disabled={isClearing}
                >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                </button>
            </div>
            
            {cartMessage && <div className="cart-message" style={{textAlign: 'center', color: '#D4AF37', margin: '1rem 0'}}>{cartMessage}</div>}

            <div className="cart-items">
                {cartItems.map(item => {
                    const product = item.product || {};
                    const idToUse = product._id || item._id;
                    
                    return (
                        <div key={idToUse} className="cart-item">
                            <img src={product.image} alt={product.name} className="cart-item-img" />
                            
                            <div className="cart-item-details">
                                <h3>{product.name}</h3>
                                <p className="cart-item-price">{product.price} EGP</p>
                                <p className="cart-item-stock">Stock: {product.stock}</p>
                            </div>

                            <div className="cart-item-actions">
                                <div className="quantity-control small">
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, -1)}
                                        disabled={item.quantity <= 1 || processingId === idToUse}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="qty-display">{item.quantity}</span>
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, 1)}
                                        disabled={item.quantity >= product.stock || processingId === idToUse}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeItem(idToUse)}
                                    disabled={processingId === idToUse}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">{total.toFixed(2)} EGP</span>
                </div>
                
                {checkoutError && <p className="error-text">{checkoutError}</p>}
                
                <button 
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                >
                    {isCheckingOut ? <Loader2 className="animate-spin" /> : "Buy Now!"}
                </button>
            </div>
        </div>
    );
};

export default CartPage;
