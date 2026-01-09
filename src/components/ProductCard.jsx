import './ProductCard.css';

const ProductCard = ({ title, price, image, stock, onAddToCart }) => {
    const isOutOfStock = stock <= 0;

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <div className="product-image-container">
                <img src={image} alt={title} className="product-image" />
            </div>
            <div className="product-info">
                <h3 className="product-title">{title}</h3>
                <p className="product-price">{price} EGP</p>
                <button 
                    className="add-to-cart-btn" 
                    disabled={isOutOfStock}
                    onClick={() => !isOutOfStock && onAddToCart()}
                >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
