import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { Loader2, X, Plus, Minus, Package as PackageIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard'; // Reusing for consistent look, but will control behavior
import usePageTitle from '../hooks/usePageTitle';
import './PackagesPage.css';

const PackagesPage = () => {
    usePageTitle('Packages');
    const { user, fetchCartCount, addToGuestCart } = useAuth();
    const navigate = useNavigate();
    
    // Data State
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Selection State
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packageProducts, setPackageProducts] = useState([]); // Products inside the selected package
    const [productsLoading, setProductsLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/packages');
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
            }
        } catch (error) {
            console.error("Failed to fetch packages", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePackageClick = async (pkg) => {
        setSelectedPackage(pkg);
        setQuantity(1);
        setPackageProducts([]);
        setProductsLoading(true);
        document.body.style.overflow = 'hidden';

        ReactGA.event("view_item", {
            currency: "EGP",
            value: pkg.price,
            items: [
                {
                    item_id: pkg._id,
                    item_name: pkg.name,
                    item_category: "package",
                    price: pkg.price
                }
            ]
        });

        // Fetch details for included products
        if (pkg.includedProducts && pkg.includedProducts.length > 0) {
            try {
                // Ensure we have IDs. Usually includedProducts might be an array of IDs or objects depending on backend population
                // The prompt for Admin said: "includedProducts": ["<ID>", "<ID>"]
                // But let's handle both strings and objects just in case
                const productIds = pkg.includedProducts.map(p => typeof p === 'object' ? p._id : p);

                const response = await fetch('https://nymedbackend.vercel.app/api/products/batch-details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productIds })
                });

                if (response.ok) {
                    const data = await response.json();
                    setPackageProducts(data);
                } else {
                    console.error("Failed to fetch match details");
                }
            } catch (error) {
                console.error("Error fetching package contents", error);
            }
        }
        setProductsLoading(false);
    };

    const closePopup = () => {
        setSelectedPackage(null);
        setPackageProducts([]);
        setAddingToCart(false);
        document.body.style.overflow = 'auto';
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'popup-overlay') {
            closePopup();
        }
    };

    const incrementQuantity = () => {
        if (selectedPackage && quantity < selectedPackage.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const confirmAddToCart = async () => {
        if (!selectedPackage) return;
        
        setAddingToCart(true);

        try {
            if (user) {
                const token = localStorage.getItem('token');
                const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        packageId: selectedPackage._id, // Updated to use packageId as requested
                        quantity: quantity
                    })
                });

                if (response.ok) {
                    ReactGA.event("add_to_cart", {
                        currency: "EGP",
                        value: selectedPackage.price * quantity,
                        items: [
                            {
                                item_id: selectedPackage._id,
                                item_name: selectedPackage.name,
                                item_category: "package",
                                price: selectedPackage.price,
                                quantity: quantity
                            }
                        ]
                    });
                    await fetchCartCount(token);
                    closePopup();
                } else {
                    const data = await response.json();
                    console.error("Cart Error:", data); // Log for developer
                    alert(data.message || "Failed to add package to cart"); // Show specific error to user
                    setAddingToCart(false);
                }
            } else {
                // Guest Flow
                const response = await fetch('https://nymedbackend.vercel.app/api/guest/add-to-cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        packageId: selectedPackage._id,
                        quantity: quantity
                    })
                });

                if (response.ok) {
                    addToGuestCart({ packageId: selectedPackage._id, quantity });
                    ReactGA.event("add_to_cart", {
                        currency: "EGP",
                        value: selectedPackage.price * quantity,
                        items: [
                            {
                                item_id: selectedPackage._id,
                                item_name: selectedPackage.name,
                                item_category: "package",
                                price: selectedPackage.price,
                                quantity: quantity
                            }
                        ]
                    });
                    closePopup();
                } else {
                    const data = await response.json();
                    alert(data.message || "Failed to add package to cart");
                    setAddingToCart(false);
                }
            }
        } catch (error) {
            console.error("Error adding to cart", error);
            alert("Error adding to cart");
            setAddingToCart(false);
        }
    };

    return (
        <div className="packages-page">
            <h1 className="page-title">Packages</h1>

            {loading ? (
                 <div className="loader-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Loader2 size={40} className="animate-spin" color="#D4AF37" />
                    <p style={{ marginTop: '1rem', color: '#666' }}>Loading Packages...</p>
                </div>
            ) : (
                <div className="packages-grid">
                    {packages.map(pkg => (
                        <div key={pkg._id} className="package-card-wrapper" onClick={() => handlePackageClick(pkg)}>
                            {/* Reusing ProductCard purely for visuals. 
                                We pass a dummy function or null for onAddToCart to potentially hide the button if ProductCard supports it, 
                                or we rely on the wrapper click. 
                                Based on ProductCard code: {onAddToCart && (... button ...)}
                                So if we pass null, button is hidden. Perfect.
                            */}
                            <ProductCard 
                                title={pkg.name}
                                price={pkg.price}
                                image={pkg.image}
                                stock={pkg.stock}
                                onAddToCart={null} // Hide button on the card
                            />
                        </div>
                    ))}
                    {packages.length === 0 && (
                        <div style={{ colSpan: 'full', textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
                            No packages available at the moment.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {selectedPackage && (
                <div className="popup-overlay" onClick={handleBackdropClick}>
                    <div className="package-modal-content">
                        <button className="popup-close" onClick={closePopup}>
                            <X size={24} />
                        </button>

                        <div className="package-detail-header">
                            <h2 className="package-detail-title">{selectedPackage.name}</h2>
                            <div className="package-detail-price">{selectedPackage.price} EGP</div>
                        </div>

                        <p className="package-description">{selectedPackage.description}</p>

                        {/* Included Products List */}
                        <div className="included-products-section">
                            <div className="section-label">Included Products</div>
                            
                            {productsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                                    <Loader2 size={24} className="animate-spin" color="#D4AF37" />
                                </div>
                            ) : (
                                <div className="products-list-compact">
                                    {packageProducts.map((prod, idx) => (
                                        <div key={prod._id || idx} className="compact-product-item">
                                            {prod.message ? (
                                                <div className="product-error">{prod.message}</div>
                                            ) : (
                                                <>
                                                    <img src={prod.image} alt={prod.name} className="compact-product-image" />
                                                    <div className="compact-product-info">
                                                        <h4 className="compact-product-name">{prod.name}</h4>
                                                    </div>
                                                    <div className="compact-product-price">{prod.price} EGP</div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {packageProducts.length === 0 && <p style={{ fontStyle: 'italic', color: '#666' }}>No specific products listed.</p>}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="modal-actions-area">
                            <div className={`stock-status ${selectedPackage.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {selectedPackage.stock > 0 ? `In Stock: ${selectedPackage.stock}` : 'Out of Stock'}
                            </div>

                            <div className="quantity-control">
                                <button className="qty-btn" onClick={decrementQuantity} disabled={quantity <= 1 || addingToCart || selectedPackage.stock <= 0}>
                                    <Minus size={18} />
                                </button>
                                <input 
                                    type="number" 
                                    className="qty-input" 
                                    value={quantity} 
                                    readOnly 
                                />
                                <button className="qty-btn" onClick={incrementQuantity} disabled={quantity >= selectedPackage.stock || addingToCart || selectedPackage.stock <= 0}>
                                    <Plus size={18} />
                                </button>
                            </div>

                            <button 
                                className="popup-confirm-btn" 
                                onClick={confirmAddToCart}
                                disabled={addingToCart || selectedPackage.stock <= 0}
                                style={{ width: '100%', maxWidth: '300px' }}
                            >
                                {addingToCart ? <Loader2 className="animate-spin" /> : "Add to Cart"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagesPage;
