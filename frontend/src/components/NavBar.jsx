import React, { useState, useRef, useEffect } from 'react'
import {useNavigate} from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAuth } from '../context/AuthContext'

function NavBar() {
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const { isAuthenticated, logout, user } = useAuth()
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Close dropdown when clicking outside
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

    return (
        <div>
            <div className='flex items-center justify-between text-sm py-4 mb-5 border-b-gray-400'>
                <h1 onClick={()=>navigate('/')} className='text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity text-primary'>TOUR GUIDE</h1>
                <ul className='hidden md:flex items-start gap-5 font-medium'>
                    <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary' : 'text-blue-900'}>
                        <li className='py-1'>HOME</li>
                        <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
                    </NavLink>
                    <NavLink to='/tours' className={({isActive}) => isActive ? 'text-primary' : 'text-blue-900'}>
                        <li className='py-1'>TOURS</li>
                        <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
                    </NavLink>
                    <NavLink to='/associations' className={({isActive}) => isActive ? 'text-primary' : 'text-blue-900'}>
                        <li className='py-1'>ASSOCIATIONS</li>
                        <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
                    </NavLink>
                    <NavLink to='/about' className={({isActive}) => isActive ? 'text-primary' : 'text-blue-900'}>
                        <li className='py-1'>ABOUT</li>
                        <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
                    </NavLink>
                </ul>
                <div className='flex item-center gap-4'>
                    {isAuthenticated() ? (
                        <div className='flex items-center gap-4'>
                            {/* Dashboard Quick Access Button */}
                            {getDashboardPath() && (
                                <button
                                    onClick={() => handleNavigation(getDashboardPath())}
                                    className='hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300'
                                >
                                    <span className="material-icons text-sm">dashboard</span>
                                    <span>Dashboard</span>
                                </button>
                            )}
                            
                            {/* Profile Dropdown */}
                            <div className='flex items-center gap-2 cursor-pointer group relative' ref={dropdownRef}>
                                <div 
                                    className='flex items-center gap-2'
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <img className='w-8 rounded-full' src={assets.profile_pic} alt="" />
                                    <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                                </div>
                                <div className={`absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 transition-all duration-300 ${
                                    showDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'
                                }`}>
                                    <div className='min-w-[12rem] bg-white shadow-lg rounded-lg flex flex-col gap-4 p-4'>
                                        {/* Dashboard Link in Dropdown */}
                                        {getDashboardPath() && (
                                            <button 
                                                onClick={() => handleNavigation(getDashboardPath())} 
                                                className='text-left hover:text-black cursor-pointer flex items-center gap-2'
                                            >
                                                <span className="material-icons text-sm">dashboard</span>
                                                Dashboard
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleNavigation('/profile')} 
                                            className='text-left hover:text-black cursor-pointer flex items-center gap-2'
                                        >
                                            <span className="material-icons text-sm">person</span>
                                            My Profile
                                        </button>
                                        <button 
                                            onClick={() => handleNavigation('/mytours')} 
                                            className='text-left hover:text-black cursor-pointer flex items-center gap-2'
                                        >
                                            <span className="material-icons text-sm">card_travel</span>
                                            My Tours
                                        </button>
                                        <button 
                                            onClick={handleLogout} 
                                            className='text-left hover:text-black cursor-pointer flex items-center gap-2 text-red-600'
                                        >
                                            <span className="material-icons text-sm">logout</span>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={()=>navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Login</button>
                    )}
                    <img onClick={()=>setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
                    {/* Mobile menu */}
                    <div className={`${showMenu ? 'fixed w-full' :'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white tranition-all`}>
                        <div className='flex items-center justify-between px-5 py-6'>
                            <img className='w-36' src={assets.logo} alt="" />
                            <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
                        </div>
                        <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                            <NavLink to='/'>HOME</NavLink>
                            <NavLink to='/tours'>TOURS</NavLink>
                            <NavLink to='/associations'>ASSOCIATIONS</NavLink>
                            <NavLink to='/about'>ABOUT</NavLink>
                            {isAuthenticated() && getDashboardPath() && (
                                <button
                                    onClick={() => {
                                        handleNavigation(getDashboardPath());
                                        setShowMenu(false);
                                    }}
                                    className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2'
                                >
                                    <span className="material-icons text-sm">dashboard</span>
                                    <span>Dashboard</span>
                                </button>
                            )}
                            {!isAuthenticated() && (
                                <button onClick={()=>navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light'>Login</button>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavBar
