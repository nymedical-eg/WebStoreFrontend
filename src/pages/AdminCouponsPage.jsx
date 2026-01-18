import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Loader2, ArrowLeft, Check } from 'lucide-react';

const AdminCouponsPage = () => {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]); // For product selection
    const [packages, setPackages] = useState([]); // For package selection
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponToDelete, setCouponToDelete] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: 0,
        maxUsage: 0,
        maxDiscountValue: 0,
        applicableProducts: [],
        applicablePackages: []
    });

    useEffect(() => {
        fetchCoupons();
        fetchProducts();
        fetchPackages();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('https://nymedbackend.vercel.app/api/coupons', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (err) {
            console.error("Error fetching coupons:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('https://nymedbackend.vercel.app/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await fetch('https://nymedbackend.vercel.app/api/packages');
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (err) {
            console.error("Error fetching packages:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = value;
        if (type === 'number') {
            // Remove leading zero if followed by integer (e.g. "07" -> "7")
            // But allow "0", "0.", "0.5" etc
            if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
                newValue = newValue.substring(1);
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const currentProducts = prev.applicableProducts || [];
            if (currentProducts.includes(productId)) {
                return { ...prev, applicableProducts: currentProducts.filter(id => id !== productId) };
            } else {
                return { ...prev, applicableProducts: [...currentProducts, productId] };
            }
        });
    };

    const handlePackageToggle = (packageId) => {
        setFormData(prev => {
            const currentPackages = prev.applicablePackages || [];
            if (currentPackages.includes(packageId)) {
                return { ...prev, applicablePackages: currentPackages.filter(id => id !== packageId) };
            } else {
                return { ...prev, applicablePackages: [...currentPackages, packageId] };
            }
        });
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                maxUsage: coupon.maxUsage,
                maxDiscountValue: coupon.maxDiscountValue,
                applicableProducts: coupon.applicableProducts || [],
                applicablePackages: coupon.applicablePackages || []
            });
        } else {
            setEditingCoupon(null);
            setFormData({ 
                code: '', 
                discountPercentage: 0, 
                maxUsage: 100, 
                maxDiscountValue: 250, 
                applicableProducts: [],
                applicablePackages: []
            });
        }
        setIsModalOpen(true);
    };

    const openDeleteModal = (coupon) => {
        setCouponToDelete(coupon);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation logic
        const discount = Number(formData.discountPercentage);
        const maxUsage = Number(formData.maxUsage);
        const maxDiscountValue = Number(formData.maxDiscountValue);

        if (discount <= 0 || discount > 100) {
            alert("Discount percentage must be between 1 and 100");
            return;
        }
        if (maxUsage <= 0) {
            alert("Max usage must be greater than 0");
            return;
        }
        if (maxDiscountValue < 0) {
            alert("Max discount value cannot be negative");
            return;
        }

        const url = editingCoupon 
            ? `https://nymedbackend.vercel.app/api/coupons/${editingCoupon._id}`
            : 'https://nymedbackend.vercel.app/api/coupons';
        
        const method = editingCoupon ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                },
                body: JSON.stringify({
                    ...formData,
                    discountPercentage: discount,
                    maxUsage: maxUsage,
                    maxDiscountValue: maxDiscountValue
                })
            });

            if (res.ok) {
                fetchCoupons();
                setIsModalOpen(false);
            } else {
                const errorData = await res.json();
                alert(`Failed to save coupon: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error saving coupon');
        }
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;
        
        try {
            const res = await fetch(`https://nymedbackend.vercel.app/api/coupons/${couponToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                }
            });

            if (res.ok) {
                fetchCoupons();
                setIsDeleteModalOpen(false);
            } else {
                alert('Failed to delete coupon');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting coupon');
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} color="#D4AF37" /></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
                <a 
                    href="/admin" 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: '#D4AF37', 
                        color: '#000', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Coupons</h1>
                <button 
                    onClick={() => openModal()}
                    style={{ 
                        backgroundColor: '#D4AF37', 
                        color: '#000', 
                        border: 'none', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={20} /> Add New Coupon
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {coupons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No coupons found.</div>
                ) : (
                    coupons.map(coupon => {
                        const isLimitReached = (coupon.usedCount || 0) >= coupon.maxUsage;
                        return (
                        <div 
                            key={coupon._id} 
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                padding: '1.5rem', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: isLimitReached ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                position: 'relative'
                            }}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#D4AF37' }}>{coupon.code}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Discount: <strong>{coupon.discountPercentage}%</strong> (Max Value: {coupon.maxDiscountValue} EGP)</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                                    Max Usage: {coupon.usedCount || 0} / {coupon.maxUsage}
                                    {isLimitReached && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '0.5rem', fontSize: '0.8rem' }}>Limit Reached</span>}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                                    Applies to: {
                                        (coupon.applicableProducts?.length > 0 || coupon.applicablePackages?.length > 0)
                                        ? `${(coupon.applicableProducts?.length || 0)} Product(s), ${(coupon.applicablePackages?.length || 0)} Package(s)` 
                                        : 'All Products & Packages'
                                    }
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => openModal(coupon)}
                                    style={{ 
                                        backgroundColor: 'transparent', 
                                        border: '1px solid #D4AF37', 
                                        color: '#D4AF37', 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => openDeleteModal(coupon)}
                                    style={{ 
                                        backgroundColor: '#ef4444', 
                                        border: 'none', 
                                        color: 'white', 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            padding: '2rem',
                            borderRadius: '8px',
                            width: '90%',
                            maxWidth: '600px', // Wider for product grid
                            position: 'relative',
                            border: '1px solid #D4AF37',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', color: '#D4AF37' }}>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Coupon Code</label>
                                <input 
                                    name="code" 
                                    placeholder="e.g. SAVE50" 
                                    value={formData.code} 
                                    onChange={handleInputChange}
                                    required
                                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Discount Percentage (%)</label>
                                    <input 
                                        name="discountPercentage" 
                                        type="number" 
                                        placeholder="50" 
                                        min="1"
                                        max="100"
                                        value={formData.discountPercentage} 
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Max Usage Count</label>
                                    <input 
                                        name="maxUsage" 
                                        type="number" 
                                        placeholder="100" 
                                        min="1"
                                        value={formData.maxUsage} 
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Max Discount Value (EGP)</label>
                                <input 
                                    name="maxDiscountValue" 
                                    type="number" 
                                    placeholder="250" 
                                    min="0"
                                    value={formData.maxDiscountValue} 
                                    onChange={handleInputChange}
                                    required
                                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Applicable Products</label>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>Select products to apply this coupon to. Leave empty to apply to ALL products.</p>
                                
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '4px', 
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {products.map(product => (
                                        <div 
                                            key={product._id} 
                                            onClick={() => handleProductToggle(product._id)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem', 
                                                padding: '0.5rem', 
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                backgroundColor: formData.applicableProducts.includes(product._id) ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '1px solid #D4AF37',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: formData.applicableProducts.includes(product._id) ? '#D4AF37' : 'transparent'
                                            }}>
                                                {formData.applicableProducts.includes(product._id) && <Check size={14} color="#000" />}
                                            </div>
                                            <span style={{ fontSize: '0.9rem' }}>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Applicable Packages</label>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>Select packages to apply this coupon to.</p>
                                
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '4px', 
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {packages.map(pkg => (
                                        <div 
                                            key={pkg._id} 
                                            onClick={() => handlePackageToggle(pkg._id)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem', 
                                                padding: '0.5rem', 
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                backgroundColor: formData.applicablePackages.includes(pkg._id) ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '1px solid #D4AF37',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: formData.applicablePackages.includes(pkg._id) ? '#D4AF37' : 'transparent'
                                            }}>
                                                {formData.applicablePackages.includes(pkg._id) && <Check size={14} color="#000" />}
                                            </div>
                                            <span style={{ fontSize: '0.9rem' }}>{pkg.name}</span>
                                        </div>
                                    ))}
                                    {packages.length === 0 && <span style={{ padding: '0.5rem', opacity: 0.6 }}>No packages available.</span>}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                style={{ 
                                    marginTop: '1rem', 
                                    backgroundColor: '#D4AF37', 
                                    color: '#000', 
                                    border: 'none', 
                                    padding: '1rem', 
                                    borderRadius: '4px', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div 
                    onClick={() => setIsDeleteModalOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            padding: '2rem',
                            borderRadius: '8px',
                            width: '90%',
                            maxWidth: '400px',
                            border: '2px solid #ef4444', 
                            textAlign: 'center'
                        }}
                    >
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '2rem' }}>Are you sure you want to delete coupon <strong>{couponToDelete?.code}</strong>? This action cannot be undone.</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                style={{ 
                                    padding: '0.5rem 1.5rem', 
                                    backgroundColor: 'transparent', 
                                    border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                style={{ 
                                    padding: '0.5rem 1.5rem', 
                                    backgroundColor: '#ef4444', 
                                    border: 'none', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponsPage;
