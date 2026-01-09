import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const products = [
    {
      id: 1,
      title: "Classic Black Stethoscope",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Suture Practice Kit",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Medical Penlight & Hammer Set",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2000&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <Hero />
      <section className="products-section" id="shop">
        <h2 className="section-title">Best Sellers</h2>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
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
