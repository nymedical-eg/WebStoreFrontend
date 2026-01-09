import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Loader2, X, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ShopPage.css';

const ShopPage = () => {
    const { user, fetchCartCount } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pollCount, setPollCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/products');
            const data = await response.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        const interval = setInterval(() => {
            setPollCount(prev => {
                if (prev < 5) {
                    fetchProducts();
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    return prev;
                }
            });
        }, 2 * 60 * 1000); 

        return () => clearInterval(interval);
    }, []);

    const handleAddToCartClick = (product) => {
        if (!user) {
            navigate('/signin');
            return;
        }
        setSelectedProduct(product);
        setQuantity(1);
        document.body.style.overflow = 'hidden'; 
    };

    const closePopup = () => {
        setSelectedProduct(null);
        setAddingToCart(false);
        document.body.style.overflow = 'auto'; 
    };

    const confirmAddToCart = async () => {
        if (!user || !selectedProduct) return;
        setAddingToCart(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: selectedProduct._id,
                    quantity: quantity
                })
            });

            if (response.ok) {
                await fetchCartCount(token); // Update global cart count
                closePopup();
            } else {
                console.error("Failed to add to cart");
                setAddingToCart(false);
            }
        } catch (error) {
            console.error("Error adding to cart", error);
            setAddingToCart(false);
        }
    };

    const incrementQuantity = () => {
        if (selectedProduct && quantity < selectedProduct.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'popup-overlay') {
            closePopup();
        }
    };

    return (
        <div className="shop-page">
            <h1 className="page-title">Shop</h1>
            
            {loading && products.length === 0 ? (
                <div className="loader-container">
                    <Loader2 size={40} className="animate-spin" color="#D4AF37" />
                    <p>Fetching Products...</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <ProductCard 
                            key={product._id}
                            title={product.name}
                            price={product.price}
                            image={product.image}
                            stock={product.stock}
                            onAddToCart={() => handleAddToCartClick(product)}
                        />
                    ))}
                </div>
            )}

            {selectedProduct && (
                <div className="popup-overlay" onClick={handleBackdropClick}>
                    <div className="popup-content">
                        <button className="popup-close" onClick={closePopup}>
                            <X size={24} />
                        </button>
                        
                        <h2 className="popup-title">{selectedProduct.name}</h2>
                        <p className="popup-description">{selectedProduct.description}</p>
                        <div className="popup-stock">Current Stock: {selectedProduct.stock}</div>
                        
                        <div className="quantity-control">
                            <button className="qty-btn" onClick={decrementQuantity} disabled={quantity <= 1 || addingToCart}>
                                <Minus size={18} />
                            </button>
                            <input 
                                type="number" 
                                className="qty-input" 
                                value={quantity} 
                                readOnly 
                            />
                            <button className="qty-btn" onClick={incrementQuantity} disabled={quantity >= selectedProduct.stock || addingToCart}>
                                <Plus size={18} />
                            </button>
                        </div>

                        <button 
                            className="popup-confirm-btn" 
                            onClick={confirmAddToCart}
                            disabled={addingToCart}
                        >
                            {addingToCart ? <Loader2 className="animate-spin" /> : "Confirm"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopPage;
