import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function NavBar() {
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const { isAuthenticated, logout, user } = useAuth()
    const [authStatus, setAuthStatus] = useState(false)
    
    const handleLogout = () => {
        logout();
        setAuthStatus(false);
        navigate('/');
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            const authenticated = await isAuthenticated();
            setAuthStatus(authenticated);
        };
        
        checkAuthStatus();
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (path) => {
        setShowDropdown(false);
        navigate(path);
    };

    const getDashboardPath = () => {
        if (!user) return null;
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'association') return '/association/dashboard';
        return null;
    };

    const navItems = [
        { path: '/', label: 'HOME' },
        { path: '/tours', label: 'TOURS' },
        { path: '/associations', label: 'ASSOCIATIONS' },
        { path: '/about', label: 'ABOUT' }
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <motion.h1 
                        onClick={() => navigate('/')} 
                        className="text-2xl font-bold cursor-pointer text-primary hover:text-orange-500 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        TOUR GUIDE
                    </motion.h1>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    relative py-2 text-sm font-medium transition-colors duration-300
                                    ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {item.label}
                                        <motion.div
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: isActive ? 1 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Auth Buttons & Profile */}
                    <div className="flex items-center space-x-4">
                        {authStatus ? (
                            <div className="flex items-center space-x-4">
                                {getDashboardPath() && (
                                    <motion.button
                                        onClick={() => handleNavigation(getDashboardPath())}
                                        className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className="material-icons text-sm">dashboard</span>
                                        <span>Dashboard</span>
                                    </motion.button>
                                )}
                                
                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <motion.div
                                        className="flex items-center space-x-2 cursor-pointer"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="relative">
                                            <img 
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
                                                src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-profile.png'} 
                                                alt="Profile" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-profile.png';
                                                }}
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <span className="material-icons text-gray-600">expand_more</span>
                                    </motion.div>

                                    <AnimatePresence>
                                        {showDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                                                        <img 
                                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" 
                                                            src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-profile.png'} 
                                                            alt="Profile" 
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/default-profile.png';
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">{user?.nom}</p>
                                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                                        </div>
                                                    </div>
                                                    {getDashboardPath() && (
                                                        <motion.button
                                                            onClick={() => handleNavigation(getDashboardPath())}
                                                            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                                                            whileHover={{ x: 5 }}
                                                        >
                                                            <span className="material-icons text-primary">dashboard</span>
                                                            <span>Dashboard</span>
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        onClick={() => handleNavigation('/profile')}
                                                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <span className="material-icons text-primary">person</span>
                                                        <span>My Profile</span>
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleNavigation('/mytours')}
                                                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <span className="material-icons text-primary">card_travel</span>
                                                        <span>My Tours</span>
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <span className="material-icons">logout</span>
                                                        <span>Logout</span>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <motion.button
                                onClick={() => navigate('/login')}
                                className="hidden md:block bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Login
                            </motion.button>
                        )}

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={() => setShowMenu(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <span className="material-icons text-gray-600">menu</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 20 }}
                        className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl md:hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            {authStatus ? (
                                <div className="flex items-center space-x-3">
                                    <img 
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
                                        src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-profile.png'} 
                                        alt="Profile" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-profile.png';
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">{user?.nom}</p>
                                        <p className="text-xs text-gray-500">{user?.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <img className="w-32" src={assets.logo} alt="Logo" />
                            )}
                            <motion.button
                                onClick={() => setShowMenu(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="material-icons text-gray-600">close</span>
                            </motion.button>
                        </div>
                        <div className="p-4 space-y-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMenu(false)}
                                    className={({ isActive }) => `
                                        block py-2 text-sm font-medium transition-colors duration-300
                                        ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}
                                    `}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            {authStatus && getDashboardPath() && (
                                <motion.button
                                    onClick={() => {
                                        handleNavigation(getDashboardPath());
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-icons text-sm">dashboard</span>
                                    <span>Dashboard</span>
                                </motion.button>
                            )}
                            {!authStatus && (
                                <motion.button
                                    onClick={() => {
                                        navigate('/login');
                                        setShowMenu(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default NavBar;
