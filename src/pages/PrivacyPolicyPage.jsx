const PrivacyPolicyPage = () => {
    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginTop: '2rem' }}>
                <h2>1. Introduction</h2>
                <p>Welcome to NY Medical. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <h2>2. Data We Collect</h2>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <ul>
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                    <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                </ul>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <h2>3. How We Use Your Data</h2>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., processing your order).</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                </ul>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <h2>4. Cookies and Analytics</h2>
                <p>We use cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.</p>
                
                <h3>Google Analytics</h3>
                <p>We use Google Analytics to analyze the use of our website. Google Analytics gathers information about website use by means of cookies. The information gathered relating to our website is used to create reports about the use of our website. Google's privacy policy is available at: <a href="https://www.google.com/policies/privacy/" target="_blank" rel="noopener noreferrer">https://www.google.com/policies/privacy/</a></p>
                
                <p>We track the following interactions to improve user experience:</p>
                <ul>
                    <li>Page views and time spent on site.</li>
                    <li>Products viewed and added to cart.</li>
                    <li>Checkout progress and completion.</li>
                </ul>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <h2>5. Contact Us</h2>
                <p>If you have any questions about this privacy policy or our privacy practices, please contact us via our Contact Page.</p>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
