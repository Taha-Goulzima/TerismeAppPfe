import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'

function Footer() {
    const navigate = useNavigate()

    const socialLinks = [
        { icon: <FaFacebookF />, href: '#' },
        { icon: <FaTwitter />, href: '#' },
        { icon: <FaInstagram />, href: '#' },
        { icon: <FaLinkedinIn />, href: 'https://www.linkedin.com/in/taha-goulzima-3822a1291/' }
    ]

    const quickLinks = ['Home', 'About Us', 'Tours', 'Contact']

    const contactInfo = [
        { icon: <FaPhoneAlt />, text: '+212 626 869 666', href: 'tel:+212626869666' },
        { icon: <FaEnvelope />, text: 'contact@tourguide.com', href: 'mailto:contact@tourguide.com' },
        { icon: <FaMapMarkerAlt />, text: '123 Travel Street, Tourism City, TC 12345' }
    ]

    return (
        <footer className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="container mx-auto px-6 pt-20 pb-12 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <motion.h1
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/')}
                            className="text-3xl font-bold cursor-pointer bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent"
                        >
                            TOUR GUIDE
                        </motion.h1>
                        <p className="text-gray-300 leading-relaxed">
                            Discover the world with us. We create unforgettable travel experiences and help you explore the most beautiful destinations around the globe.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-orange-400">Quick Links</h3>
                        <ul className="space-y-4">
                            {quickLinks.map((item, index) => (
                                <motion.li
                                    key={index}
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '')}`}
                                        className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"
                                    >
                                        <span className="w-1 h-1 bg-orange-400 rounded-full" />
                                        {item}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-orange-400">Contact Info</h3>
                        <ul className="space-y-4">
                            {contactInfo.map((item, index) => (
                                <motion.li
                                    key={index}
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-start gap-3 text-gray-300"
                                >
                                    <span className="text-orange-400 mt-1">{item.icon}</span>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className="hover:text-orange-400 transition-colors duration-300"
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <span>{item.text}</span>
                                    )}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Newsletter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-orange-400">Newsletter</h3>
                        <p className="text-gray-300">Subscribe to our newsletter for travel updates and special offers.</p>
                        <form className="space-y-3">
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                type="email"
                                placeholder="Your email address"
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                            >
                                Subscribe
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                {/* Copyright Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="border-t border-gray-700 pt-8"
                >
                    <p className="text-center text-gray-400 text-sm">
                        Copyright © {new Date().getFullYear()} TOUR GUIDE - All Rights Reserved.
                    </p>
                </motion.div>
            </div>
        </footer>
    )
}

export default Footer