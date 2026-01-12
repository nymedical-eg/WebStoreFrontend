import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Loader2, ArrowLeft } from 'lucide-react';

const AdminProductsPage = () => {
    const CLOUD_NAME = "dndk6lbq3"; 
    const UPLOAD_PRESET = "NYmedUploadPreset";

    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        stock: 0,
        price: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('https://nymedbackend.vercel.app/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle number inputs cleanly to avoid "07" but allow "0"
        let newValue = value;
        if (name === 'stock' || name === 'price') {
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);

        try {
            if (CLOUD_NAME === "YOUR_CLOUD_NAME" || UPLOAD_PRESET === "YOUR_UNSIGNED_UPLOAD_PRESET") {
               alert("Please set your Cloudinary Cloud Name and Upload Preset in the code!");
               setUploading(false);
               return;
            }

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

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                image: product.image,
                stock: product.stock,
                price: product.price
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', image: '', stock: 0, price: 0 });
        }
        setIsModalOpen(true);
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = editingProduct 
            ? `https://nymedbackend.vercel.app/api/products/${editingProduct._id}`
            : 'https://nymedbackend.vercel.app/api/products';
        
        const method = editingProduct ? 'PUT' : 'POST';

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
                    stock: Number(formData.stock),
                    price: Number(formData.price)
                })
            });

            if (res.ok) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                alert('Failed to save product');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving product');
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        
        try {
            const res = await fetch(`https://nymedbackend.vercel.app/api/products/${productToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                }
            });

            if (res.ok) {
                fetchProducts();
                setIsDeleteModalOpen(false);
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting product');
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
                <h1>Manage Products</h1>
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
                    <Plus size={20} /> Add New Product
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map(product => (
                    <div 
                        key={product._id} 
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            padding: '1.5rem', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                                <p style={{ margin: 0, color: '#D4AF37', fontWeight: 'bold' }}>{product.price} EGP</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Stock: {product.stock}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => openModal(product)}
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
                                onClick={() => openDeleteModal(product)}
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
                ))}
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
                            maxWidth: '500px',
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
                        <h2 style={{ marginBottom: '1.5rem', color: '#D4AF37' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Product Name</label>
                                <input 
                                    name="name" 
                                    placeholder="e.g. Suture Kit" 
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    required
                                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Description</label>
                                <textarea 
                                    name="description" 
                                    placeholder="Product details..." 
                                    value={formData.description} 
                                    onChange={handleInputChange}
                                    required
                                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px', minHeight: '100px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Product Image</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                />
                                {uploading && <p style={{ fontSize: '0.8rem', color: '#D4AF37' }}>Uploading...</p>}
                                {formData.image && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Preview:</p>
                                        <img src={formData.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D4AF37' }} />
                                    </div>
                                )}
                                <input 
                                    name="image" 
                                    type="hidden"
                                    value={formData.image} 
                                    readOnly
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Price (EGP)</label>
                                    <input 
                                        name="price" 
                                        type="number" 
                                        placeholder="0.00" 
                                        step="0.01"
                                        min="0"
                                        value={formData.price} 
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Stock</label>
                                    <input 
                                        name="stock" 
                                        type="number" 
                                        placeholder="0" 
                                        step="1"
                                        min="0"
                                        value={formData.stock} 
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid #D4AF37', color: 'var(--text-primary)', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={uploading}
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
                                {uploading ? 'Uploading Image...' : (editingProduct ? 'Save Changes' : 'Create Product')}
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
                            border: '2px solid #ef4444', // Red tiny borders as requested
                            textAlign: 'center'
                        }}
                    >
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '2rem' }}>Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.</p>
                        
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

export default AdminProductsPage;
