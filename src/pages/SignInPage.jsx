import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignInPage.css';
import usePageTitle from '../hooks/usePageTitle';

const SignInPage = () => {
    usePageTitle('Sign In');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        governorate: '',
        city: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Password Validation Rules
    const hasMinLength = formData.password.length >= 8;
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    
    // Only validate strength on registration or if entering new password
    const passwordValid = isLogin ? formData.password.length > 0 : (hasMinLength && hasNumber && hasSpecialChar);
    const passwordsMatch = !isLogin ? formData.password === formData.confirmPassword : true;

    useEffect(() => {
        if (isLogin) {
            setIsValid(formData.email && formData.password);
        } else {
            setIsValid(
                formData.firstName && 
                formData.lastName && 
                formData.email && 
                formData.phone && 
                formData.governorate &&
                formData.city &&
                formData.address &&
                passwordValid && 
                passwordsMatch
            );
        }
    }, [formData, isLogin, passwordValid, passwordsMatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? 'api/auth/login' : 'api/auth/register';
        const url = `https://nymedbackend.vercel.app/${endpoint}`;
        
        const body = isLogin ? {
            email: formData.email,
            password: formData.password
        } : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            email: formData.email,
            phone: formData.phone,
            governorate: formData.governorate,
            city: formData.city,
            address: formData.address,
            password: formData.password
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (!isLogin) {
                // If registration success, auto-login logic
                if (!data.token) {
                   await autoLogin();
                } else {
                   handleAuthSuccess(data);
                }
            } else {
                handleAuthSuccess(data);
            }

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const autoLogin = async () => {
         try {
            const loginUrl = `https://nymedbackend.vercel.app/api/auth/login`;
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await response.json();
             if (!response.ok) throw new Error(data.message);
             handleAuthSuccess(data);
         } catch (err) {
             setError('Registration successful, but auto-login failed. Please sign in.');
             setIsLogin(true);
             setIsLoading(false);
         }
    };

    const handleAuthSuccess = async (data) => {
        const token = data.token;
        if (!token) {
            setError("Login successful but no token received.");
            setIsLoading(false);
            return;
        }

        // 1. Extract User Data securely
        let rawUser = data.user || data.existingUser;

        // If registration and no user returned, use form data (but be careful)
        if (!rawUser && !isLogin) {
            rawUser = { ...formData };
        }

        // 2. If User is still missing, try to fetch it
        if (!rawUser) {
            try {
                // Try common endpoints
                const res = await fetch('https://nymedbackend.vercel.app/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const profileData = await res.json();
                    rawUser = profileData.user || profileData; // Handle nested or flat return
                }
            } catch (fetchErr) {
                console.error("Error fetching profile:", fetchErr);
            }
        }

        // 3. Last resort fallback
        if (!rawUser) {
             rawUser = { firstName: 'Member', email: formData.email || 'No Email' };
        }

        // 4. Sanitize: Remove password fields explicitly
        const sanitizedUser = { ...rawUser };
        delete sanitizedUser.password;
        delete sanitizedUser.confirmPassword;

        login(sanitizedUser, token);
        setIsLoading(false);
        navigate('/'); 
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">{isLogin ? "Sign In" : "Sign Up"}</h1>
                <p className="auth-subtitle">
                    {isLogin ? "Please sign in to your account." : "Create your account to get started."}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        placeholder="First Name" 
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        placeholder="Last Name" 
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    placeholder="Phone Number" 
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="governorate" 
                                        placeholder="Governorate" 
                                        value={formData.governorate}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="city" 
                                        placeholder="City" 
                                        value={formData.city}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    name="address" 
                                    placeholder="Full Address" 
                                    value={formData.address}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group password-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Password" 
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                        <button 
                            type="button" 
                            className="eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <>
                             <div className="validation-rules">
                                <p className={hasMinLength ? "valid" : ""}>• At least 8 characters</p>
                                <p className={hasNumber ? "valid" : ""}>• At least 1 number</p>
                                <p className={hasSpecialChar ? "valid" : ""}>• At least 1 special character</p>
                            </div>

                            <div className="form-group password-group">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmPassword" 
                                    placeholder="Confirm Password" 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    className="eye-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && !passwordsMatch && (
                                <p className="error-text">Passwords do not match</p>
                            )}
                        </>
                    )}

                    {isLogin && (
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <button 
                        type="submit" 
                        className={`submit-btn ${isValid ? 'ready' : ''}`}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={20} />
                            </div>
                        ) : (
                            isLogin ? "Sign In" : "Sign Up"
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? (
                        <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up now</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
