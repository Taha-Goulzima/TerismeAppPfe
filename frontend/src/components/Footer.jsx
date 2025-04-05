import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

function Footer() {
    const navigate = useNavigate()

    const socialLinks = [
        { icon: <FaFacebookF />, href: '#' },
        { icon: <FaTwitter />, href: '#' },
        { icon: <FaInstagram />, href: '#' },
        { icon: <FaLinkedinIn />, href: '#' }
    ]

    return (
        <footer className="bg-gray-50">
            <div className='container mx-auto px-6 pt-16 pb-8'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16'>
                    {/**-----------left section------------- */}
                    <div className='space-y-6'>
                        <h1 
                            onClick={() => navigate('/')} 
                            className='text-2xl font-bold cursor-pointer hover:text-primary transition-colors duration-300 text-primary'
                        >
                            TOUR GUIDE
                        </h1>
                        <p className='text-gray-600 leading-relaxed'>
                            Discover the world with us. We create unforgettable travel experiences and help you explore the most beautiful destinations around the globe.
                        </p>
                        <div className='flex gap-4'>
                            {socialLinks.map((social, index) => (
                                <a 
                                    key={index} 
                                    href={social.href}
                                    className='w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors duration-300'
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    {/**-----------center section------------- */}
                    <div className='space-y-6'>
                        <h3 className='text-xl font-semibold text-gray-900'>Quick Links</h3>
                        <ul className='space-y-4'>
                            {['Home', 'About Us', 'Tours', 'Contact'].map((item, index) => (
                                <li key={index}>
                                    <Link 
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '')}`}
                                        className='text-gray-600 hover:text-primary transition-colors duration-300'
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/**-----------right section------------- */}
                    <div className='space-y-6'>
                        <h3 className='text-xl font-semibold text-gray-900'>Contact Info</h3>
                        <ul className='space-y-4'>
                            <li className='flex items-center gap-3 text-gray-600'>
                                <FaPhoneAlt className='text-primary' />
                                <a href="tel:+212626869666" className='hover:text-primary transition-colors duration-300'>
                                    +212 626 869 666
                                </a>
                            </li>
                            <li className='flex items-center gap-3 text-gray-600'>
                                <FaEnvelope className='text-primary' />
                                <a href="mailto:contact@tourguide.com" className='hover:text-primary transition-colors duration-300'>
                                    contact@tourguide.com
                                </a>
                            </li>
                            <li className='flex items-start gap-3 text-gray-600'>
                                <FaMapMarkerAlt className='text-primary mt-1' />
                                <span>123 Travel Street, Tourism City, TC 12345</span>
                            </li>
                        </ul>
                    </div>
                    {/**-----------newsletter section------------- */}
                    <div className='space-y-6'>
                        <h3 className='text-xl font-semibold text-gray-900'>Newsletter</h3>
                        <p className='text-gray-600'>Subscribe to our newsletter for travel updates and special offers.</p>
                        <form className='space-y-3'>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary'
                            />
                            <button 
                                type="submit" 
                                className='w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300'
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                {/**---------copyright text------------ */}
                <div className='border-t border-gray-200'>
                    <p className='pt-8 text-center text-gray-600 text-sm'>
                        Copyright © {new Date().getFullYear()} TOUR GUIDE - All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer