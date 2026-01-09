import './Hero.css';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1>Essential Tools for Your<br/>Medical Journey</h1>
                <Link to="/shop">
                    <button className="cta-btn">Shop Student Essentials</button>
                </Link>
            </div>
        </section>
    );
};

export default Hero;
