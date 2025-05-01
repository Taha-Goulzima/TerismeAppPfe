import React from 'react';
import { assets } from '../assets/assets';

function About() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] flex flex-col justify-center items-center bg-cover bg-center text-white text-center" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.tour})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <h2 className="text-4xl font-bold mb-4">ABOUT US</h2>
        <p className="text-xl mt-4 font-semibold max-w-2xl px-4">YOUR JOURNEY BEGINS WITH OUR EXPERTISE</p>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <span className="text-yellow-500 font-bold uppercase tracking-wider">Why Choose Us</span>
            <h3 className="text-3xl font-bold text-indigo-900 mt-2 mb-6">We Provide You Best Tours</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              With over a decade of experience in crafting unforgettable journeys, we pride ourselves on creating unique and immersive travel experiences. Our expert guides and carefully curated itineraries ensure that every moment of your tour is both enriching and enjoyable.
            </p>
            <ul className="space-y-4">
              {[
                'Expert Local Guides',
                'Customizable Itineraries',
                '24/7 Customer Support',
                'Best Price Guarantee'
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={assets.tourImg02} alt="Tour experience 1" className="rounded-lg shadow-lg" />
            <img src={assets.heroImg02} alt="Tour experience 2" className="rounded-lg shadow-lg mt-8" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-8 border-t border-b border-gray-200">
          {[
            { number: '10+', text: 'Years Experience' },
            { number: '1000+', text: 'Happy Customers' },
            { number: '500+', text: 'Destinations' },
            { number: '100%', text: 'Satisfaction' },
          ].map((stat, index) => (
            <div key={index} className="p-4">
              <div className="text-3xl font-bold text-indigo-900">{stat.number}</div>
              <div className="text-gray-600">{stat.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;