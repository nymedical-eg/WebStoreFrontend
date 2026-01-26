import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Plus, Edit, Trash2, X, Save, Search, Check, Package, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import './AdminPackagesPage.css';
import '../styles/AdminResponsive.css';

const AdminPackagesPage = () => {
    const CLOUD_NAME = "dndk6lbq3"; 
    const UPLOAD_PRESET = "NYmedUploadPreset";

    usePageTitle('Admin - Packages');
    const { user } = useAuth();
    const [packages, setPackages] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For Delete Confirmation
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        price: '',
        stock: '',
        includedProducts: []
    });
    const [packageToDelete, setPackageToDelete] = useState(null); // Track package to delete

    useEffect(() => {
        fetchPackages();
        fetchProducts();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/packages');
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            image: pkg.image,
            price: pkg.price,
            stock: pkg.stock,
            includedProducts: pkg.includedProducts.map(p => typeof p === 'object' ? p._id : p) // Handle if populated or not
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (pkg) => {
        setPackageToDelete(pkg);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!packageToDelete) return;
        setActionLoading(true);
        try {
            const response = await fetch(`https://nymedbackend.vercel.app/api/packages/${packageToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': 'admin'
                }
            });

            if (response.ok) {
                setPackages(packages.filter(p => p._id !== packageToDelete._id));
                setIsDeleteModalOpen(false);
                setPackageToDelete(null);
            } else {
                 const data = await response.json();
                 alert(data.message || 'Failed to delete package');
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            alert('Error deleting package');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validation
        if (Number(formData.price) <= 0) {
            alert('Price must be greater than 0');
            return;
        }
        if (Number(formData.stock) < 0) {
            alert('Stock cannot be negative');
            return;
        }

        setActionLoading(true);

        const url = editingPackage 
            ? `https://nymedbackend.vercel.app/api/packages/${editingPackage._id}`
            : 'https://nymedbackend.vercel.app/api/packages';
        
        const method = editingPackage ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': 'admin'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchPackages();
                setIsModalOpen(false);
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to save package');
            }
        } catch (error) {
            console.error('Error saving package:', error);
            alert('Error saving package');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
             name: '',
            description: '',
            image: '',
            price: '',
            stock: '',
            includedProducts: []
        });
        setEditingPackage(null);
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const currentProducts = prev.includedProducts;
            if (currentProducts.includes(productId)) {
                return { ...prev, includedProducts: currentProducts.filter(id => id !== productId) };
            } else {
                return { ...prev, includedProducts: [...currentProducts, productId] };
            }
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: data
            });

            const uploadedImage = await res.json();
            
            if (uploadedImage.secure_url) {
                setFormData(prev => ({
                    ...prev,
                    image: uploadedImage.secure_url
                }));
            } else {
                 alert("Upload failed. Check console for details.");
                 console.error("Cloudinary Error:", uploadedImage);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const filteredPackages = packages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        </div>
    );

    return (
        <div className="admin-page-container">
            <div style={{ marginBottom: '1rem' }}>
                <Link 
                    to="/admin" 
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
                </Link>
            </div>
            <div className="admin-header">
                <h1 className="admin-title">Manage Packages</h1>
                <button 
                    className="add-btn"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                >
                    <Plus size={20} /> Add Package
                </button>
            </div>

            <div className="search-bar">
                <Search size={20} />
                <input 
                    type="text" 
                    placeholder="Search packages..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="admin-table table-mobile-cards">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackages.map(pkg => (
                            <tr key={pkg._id}>
                                <td>
                                    <div className="product-cell">
                                        {pkg.image ? (
                                             <img src={pkg.image} alt={pkg.name} className="product-thumb" />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>{pkg.name}</td>
                                <td>{pkg.price} EGP</td>
                                <td>
                                    <span className={`stock-badge ${pkg.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {pkg.stock}
                                    </span>
                                </td>
                                <td>{pkg.includedProducts?.length || 0} items</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn edit" onClick={() => handleEdit(pkg)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDeleteClick(pkg)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPackages.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                    No packages found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content mobile-modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-row mobile-stack">
                                <div className="form-group">
                                    <label>Package Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price (EGP)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0.01"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row mobile-stack">
                                <div className="form-group">
                                     <label>Stock</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                    />
                                </div>
                                 <div className="form-group">
                                    <label>Package Image</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ flex: 1 }}
                                        />
                                        {uploading && <Loader2 className="animate-spin" size={24} color="#D4AF37" />}
                                        {formData.image && !uploading && (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    {formData.image && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.image}</p>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Included Products</label>
                                <div className="products-selection-grid" style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                    gap: '1rem', 
                                    maxHeight: '300px', 
                                    overflowY: 'auto',
                                    border: '1px solid var(--border-color)',
                                    padding: '1rem',
                                    borderRadius: '8px'
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
                                                border: formData.includedProducts.includes(product._id) ? '1px solid #D4AF37' : '1px solid transparent',
                                                backgroundColor: formData.includedProducts.includes(product._id) ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-secondary)',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '20px', 
                                                height: '20px', 
                                                border: '1px solid #D4AF37', 
                                                borderRadius: '4px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                backgroundColor: formData.includedProducts.includes(product._id) ? '#D4AF37' : 'white' 
                                            }}>
                                                {formData.includedProducts.includes(product._id) && <Check size={14} color="#000" />}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                    Selected: {formData.includedProducts.length} items
                                </p>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Package</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && packageToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                         <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            backgroundColor: '#fee2e2', 
                            color: '#ef4444', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            margin: '0 auto 1rem' 
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Package?</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong>{packageToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center' }}>
                            <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button 
                                className="delete-btn" 
                                onClick={confirmDelete}
                                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Delete Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPackagesPage;
