const ContactPage = () => {
    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Contact Us</h1>
            <p>
                Reach out to us for any inquiries at{' '}
                <a 
                    href="mailto:nymedical.eg@gmail.com" 
                    style={{ color: '#D4AF37', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                    nymedical.eg@gmail.com
                </a>.
            </p>
        </div>
    );
};

export default ContactPage;
