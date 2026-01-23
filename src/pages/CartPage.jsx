import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Trash2, Plus, Minus, Tag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import './CartPage.css';
import usePageTitle from '../hooks/usePageTitle';

const CartPage = () => {
    usePageTitle('Your Cart');
    const { user, fetchCartCount, guestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); 
    const [isClearing, setIsClearing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [cartMessage, setCartMessage] = useState('');
    
    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        // No redirect for guests
        fetchCart();
    }, [user, navigate, guestCart]); // Re-run if user logs in/out or guestCart changes (for local updates)

    const fetchCart = async () => {
        try {
            if (user) {
                // Authenticated fetch
                const token = localStorage.getItem('token');
                const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    setCartItems(data.cart || []);
                    setTotal(data.total || 0);
                    setSubtotal(data.subtotal || data.total || 0); 
                    setDiscount(data.discount || 0);
                    setAppliedCoupon(data.coupon || null);
                    
                    ReactGA.send({ hitType: "pageview", page: "/cart", title: "Cart" });
                }
            } else {
                // Guest fetch
                // Need to send local items to get details
                const items = JSON.parse(localStorage.getItem('guestCart') || '[]');
                if (items.length === 0) {
                    setCartItems([]);
                    setTotal(0);
                    setSubtotal(0);
                    setDiscount(0);
                    setAppliedCoupon(null);
                    setLoading(false);
                    return;
                }

                const response = await fetch('https://nymedbackend.vercel.app/api/guest/view-cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, couponCode: localStorage.getItem('guestCoupon') }) 
                });
                
                const data = await response.json();
                if (response.ok) {
                    setCartItems(data.cart || []);
                    
                    // Call calculate-cart for accurate totals
                    try {
                        const calcResponse = await fetch('https://nymedbackend.vercel.app/api/guest/calculate-cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                items, 
                                couponCode: localStorage.getItem('guestCoupon') 
                            })
                        });
                        
                        if (calcResponse.ok) {
                            const calcData = await calcResponse.json();
                            setTotal(calcData.total || 0);
                            setSubtotal(calcData.subtotal || 0);
                            setDiscount(calcData.discount || 0);
                            
                            // Coupon validation: Update or Clear
                            setAppliedCoupon(calcData.coupon || null);
                        } else {
                            // Fallback to view-cart data if calculate fails
                            setTotal(data.total || 0);
                            setSubtotal(data.subtotal || 0);
                            setDiscount(data.discount || 0);
                            // If calculate fails, maybe clear coupon too? 
                            setAppliedCoupon(null);
                        }
                    } catch (e) {
                        console.error("Failed to calculate cart", e);
                         // Fallback
                        setTotal(data.total || 0);
                        setSubtotal(data.subtotal || 0);
                        setDiscount(data.discount || 0);
                        setAppliedCoupon(null);
                    }
                    
                     ReactGA.send({ hitType: "pageview", page: "/cart", title: "Guest Cart" });
                }
            }
        } catch (error) {
            console.error("Error fetching cart", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, currentQty, delta, isPackage = false) => {
        // ... (unchanged)
        const newQty = delta === 1 ? 1 : -1; 
        const targetQty = currentQty + newQty; 
        
        setProcessingId(itemId);
        setCartMessage(''); 
        
        const url = `https://nymedbackend.vercel.app/api/cart/${itemId}`;
        const body = { quantity: newQty };

        try {
            if (user) {
               // ... 
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
                    setTimeout(() => setCartMessage(''), 3000);
                }

                if (response.ok) {
                   await fetchCart(); 
                } else {
                    console.error("Failed to update quantity");
                }
            } else {
                // Guest
                const response = await fetch('https://nymedbackend.vercel.app/api/guest/update-quantity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        [isPackage ? 'packageId' : 'productId']: itemId,
                        quantity: targetQty
                    })
                });
                
                if (response.ok) {
                    updateGuestCartItem(itemId, targetQty, isPackage);
                    // Fetch cart to recalculate totals
                    await fetchCart();
                } else {
                     const data = await response.json();
                     setCartMessage(data.message || "Failed to update");
                }
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
            if (user) {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://nymedbackend.vercel.app/api/cart/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    ReactGA.event("remove_from_cart", {
                       currency: "EGP",
                       items: [{ item_id: productId }]
                    });
                    await fetchCart(); 
                    fetchCartCount(token); 
                } else {
                    console.error("Failed to remove item");
                }
            } else {
                // Guest - just local remove, no backend call needed for simple remove 
                // UNLESS backend calculates totals on view-cart using items list. 
                // Context helper updates local storage.
                removeFromGuestCart(productId, false); // How do we know if package? 
                // The item in map has .package or .product. 
                // But `removeItem` receives `idToUse`.
                // We need to know if it's a package.
                // I'll update the call site to pass isPackage later?
                // Or I can try to remove from both using the ID? ID should be unique across both or valid.
                // Wait, if I have just ID, I might not know.
                // I'll update `removeItem` signature in the render loop to pass `isPackage`.
            }
        } catch (error) {
            console.error("Error removing item", error);
        } finally {
            setProcessingId(null);
        }
    };
    // Helper to fix signature in render
    const handleRemoveItem = (id, isPackage) => {
        if (user) {
            removeItem(id); // Original signature
        } else {
             removeFromGuestCart(id, isPackage);
        }
    };

    const clearCart = async () => {
        setIsClearing(true);
        setCartMessage('');
        try {
            if (user) {
                const token = localStorage.getItem('token');
                const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    ReactGA.event("delete_cart", {
                        event_category: "cart",
                        event_label: "Clear Cart"
                    });
                    await fetchCart();
                    fetchCartCount(token);
                }
            } else {
                clearGuestCart();
                // View cart will see empty array and reset state
            }
        } catch (error) {
            console.error("Error clearing cart", error);
        } finally {
            setIsClearing(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        setIsApplyingCoupon(true);
        setCartMessage('');
        
        try {
            if (user) {
                const token = localStorage.getItem('token');
                const response = await fetch('https://nymedbackend.vercel.app/api/cart/apply-coupon', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ code: couponCode })
                });

                const data = await response.json();

                if (response.ok) {
                    setCartMessage('Coupon applied successfully!');
                    await fetchCart(); 
                    setCouponCode('');
                } else {
                    setCheckoutError(data.message || 'Failed to apply coupon');
                    setTimeout(() => setCheckoutError(''), 3000);
                }
            } else {
                // Guest
                const items = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const response = await fetch('https://nymedbackend.vercel.app/api/guest/apply-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: couponCode, items })
                });
                
                const data = await response.json();
                if (response.ok) {
                    // Store coupon locally to resend on view-cart
                    localStorage.setItem('guestCoupon', couponCode);
                    setCartMessage('Coupon applied!');
                    await fetchCart();
                    setCouponCode('');
                } else {
                    setCheckoutError(data.message || 'Failed to apply coupon');
                }
            }
        } catch (error) {
            setCheckoutError('Error applying coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = async () => {
        setIsApplyingCoupon(true);
        setCartMessage('');
        
        try {
            if (user) {
                const token = localStorage.getItem('token');
                const response = await fetch('https://nymedbackend.vercel.app/api/cart/remove-coupon', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    setCartMessage('Coupon removed.');
                    await fetchCart(); 
                } else {
                    const data = await response.json();
                    setCheckoutError(data.message || 'Failed to remove coupon');
                }
            } else {
                 localStorage.removeItem('guestCoupon');
                 setCartMessage('Coupon removed.');
                 await fetchCart();
            }
        } catch (error) {
            setCheckoutError('Error removing coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            navigate('/checkout');
            return;
        }

        setIsCheckingOut(true);
        setCheckoutError('');
        setCartMessage('');
        
        ReactGA.event("begin_checkout", {
            currency: "EGP",
            value: total,
            items: cartItems.map(item => ({
                item_id: item.product?._id || item.package?._id || item._id,
                item_name: item.product?.name || item.package?.name,
                price: item.product?.price || item.package?.price,
                quantity: item.quantity
            }))
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/orders', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                ReactGA.event("purchase", {
                    transaction_id: await response.clone().json().then(d => d._id || d.orderId || Date.now().toString()), 
                    currency: "EGP",
                    value: total,
                    items: cartItems.map(item => ({
                        item_id: item.product?._id || item.package?._id || item._id,
                        item_name: item.product?.name || item.package?.name,
                        price: item.product?.price || item.package?.price,
                        quantity: item.quantity
                    }))
                });
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
                    // Determine if item is a product or a package
                    const isPackage = !!item.package;
                    const displayItem = isPackage ? item.package : item.product;
                    
                    if (!displayItem) return null; // Skip invalid items

                    const idToUse = displayItem._id || item._id; 
                    const imageSrc = displayItem.image || displayItem.img || (displayItem.images && displayItem.images[0]) || item.image || item.img;
                    
                    return (
                        <div key={idToUse} className="cart-item">
                            {imageSrc ? (
                                <img src={imageSrc} alt={displayItem.name} className="cart-item-img" />
                            ) : (
                                <div className="cart-item-img-placeholder" style={{width: '80px', height: '80px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No Image</div>
                            )}
                            
                            <div className="cart-item-details">
                                <h3>{displayItem.name} {isPackage && <span style={{fontSize: '0.8rem', color: '#D4AF37', border: '1px solid #D4AF37', borderRadius: '4px', padding: '0 4px'}}>Package</span>}</h3>
                                <p className="cart-item-price">{displayItem.price} EGP</p>
                                <p className="cart-item-stock">Stock: {displayItem.stock}</p>
                            </div>

                            <div className="cart-item-actions">
                                <div className="quantity-control small">
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, -1, isPackage)}
                                        disabled={item.quantity <= 1 || processingId === idToUse}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="qty-display">{item.quantity}</span>
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, 1, isPackage)}
                                        disabled={item.quantity >= displayItem.stock || processingId === idToUse}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                
                                <button 
                                    className="remove-btn"
                                    onClick={() => handleRemoveItem(idToUse, isPackage)}
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
                
                {/* Coupon Section */}
                <div className="coupon-section">
                    {appliedCoupon ? (
                        <div className="applied-coupon">
                            <div className="coupon-code">
                                <Tag size={16} />
                                {appliedCoupon.code || appliedCoupon} Applied
                            </div>
                            <button 
                                className="remove-coupon-btn" 
                                onClick={removeCoupon}
                                disabled={isApplyingCoupon}
                                title="Remove Coupon"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="coupon-input-group">
                            <input 
                                type="text" 
                                placeholder="Coupon Code" 
                                className="coupon-input"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button 
                                className="apply-coupon-btn" 
                                onClick={applyCoupon}
                                disabled={isApplyingCoupon || !couponCode.trim()}
                            >
                                {isApplyingCoupon ? <Loader2 size={16} className="animate-spin"/> : 'Apply'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                    <div className="cart-summary-row">
                        <span className="cart-summary-label">Subtotal:</span>
                        <span className="cart-summary-value">{subtotal.toFixed(2)} EGP</span>
                    </div>
                    {discount > 0 && (
                        <div className="cart-summary-row">
                            <span className="cart-summary-label">Discount:</span>
                            <span className="cart-summary-value discount-value">- {discount.toFixed(2)} EGP</span>
                        </div>
                    )}
                    <div className="cart-summary-row total">
                        <span className="cart-summary-label">Total:</span>
                        <span className="cart-summary-value total-amount">{total.toFixed(2)} EGP</span>
                    </div>
                </div>
                
                {checkoutError && <p className="error-text" style={{marginTop: '1rem', color: '#ef4444'}}>{checkoutError}</p>}
                
                <div style={{ marginTop: '1.5rem' }}>
                    <button 
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? <Loader2 className="animate-spin" /> : "Buy Now!"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
