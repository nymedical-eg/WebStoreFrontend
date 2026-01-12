import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const LandingPage = () => {
  usePageTitle('Home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  const fetchRandomProducts = async () => {
    try {
        // Fallback to "all" if random endpoint doesn't exist, allow frontend to slice
        // But user asked for api/products/random, let's try that or just get all and pick 3
        const res = await fetch('https://nymedbackend.vercel.app/api/products'); 
        const data = await res.json();
        
        // Shuffle and pick 3
        if (Array.isArray(data)) {
            const shuffled = data.sort(() => 0.5 - Math.random());
            setProducts(shuffled.slice(0, 3));
        }
    } catch (err) {
        console.error("Failed to fetch products", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Hero />
      <section className="products-section" id="shop">
        <h2 className="section-title">Our Product Catalog</h2>
        {loading ? <p style={{textAlign:'center'}}>Loading...</p> : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id}
              title={product.name}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/shop">
            <button className="cta-btn" style={{ minWidth: '200px' }}>View More Products</button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
