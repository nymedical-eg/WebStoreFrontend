import './Footer.css';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Tiktok Icon since it might be missing or specialized
const TiktokIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <Link to="/contact">Contact</Link>
                    <Link to="/shipping">Shipping & Returns</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>
                <div className="social-links">
                    <a href="https://www.instagram.com/nymedical.eg" target="_blank" rel="noopener noreferrer" className="social-icon"><Facebook size={20} /></a>
                    <a href="https://www.instagram.com/nymedical.eg" target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={20} /></a>
                    <a href="https://x.com/nymedical_eg" target="_blank" rel="noopener noreferrer" className="social-icon"><Twitter size={20} /></a>
                    <a href="https://www.tiktok.com/@nymedical.eg" target="_blank" rel="noopener noreferrer" className="social-icon"><TiktokIcon size={20} /></a>
                </div>
                <div className="copyright">
                    &copy; 2026 N&Y Medical Equipment. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
