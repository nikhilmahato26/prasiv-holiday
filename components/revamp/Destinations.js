'use client'
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const DOMESTIC_DESTINATIONS = [
  { name: 'Gujarat', image: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80', tag: 'Land of Legends' },
  { name: 'Kashmir', image: 'https://images.unsplash.com/photo-1566837430227-b88af66e99c1?w=800&q=80', tag: 'Paradise on Earth' },
  { name: 'Himachal Pradesh', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80', tag: 'Snowy Peaks' },
  { name: 'Uttarakhand', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80', tag: 'Devbhoomi Valley' },
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', tag: 'Sun & Beaches' },
  { name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', tag: 'God\'s Own Country' },
  { name: 'Maharashtra', image: 'https://images.unsplash.com/photo-1562158147-f8d6fbcd76f8?w=800&q=80', tag: 'Heritage & Hills' },
  { name: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80', tag: 'Land of Temples' },
  { name: 'Odisha', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80', tag: 'Art & Temples' },
  { name: 'Sikkim', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80', tag: 'Himalayan Beauty' },
  { name: 'Darjeeling', image: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=800&q=80', tag: 'Queen of Hills' },
  { name: 'Meghalaya', image: 'https://images.unsplash.com/photo-1503756234508-e32369269deb?w=800&q=80', tag: 'Abode of Clouds' },
  { name: 'Andaman & Nicobar', image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80', tag: 'Tropical Paradise' },
  { name: 'Leh Ladakh', image: 'https://images.unsplash.com/photo-1594993876063-d082a41f6e8d?w=800&q=80', tag: 'High Mountain Passes' },
];

const INTERNATIONAL_DESTINATIONS = [
  { name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', tag: 'Land of Smiles' },
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', tag: 'Island of Gods' },
  { name: 'Vietnam', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80', tag: 'Scenic Halong Bay' },
  { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', tag: 'Modern Oasis' },
  { name: 'Bhutan', image: 'https://images.unsplash.com/photo-1578593139811-2921a28a30de?w=800&q=80', tag: 'Land of Thunder Dragon' },
];

const Destinations = () => {
  const [activeTab, setActiveTab] = useState('india');

  const shownDestinations = activeTab === 'india' ? DOMESTIC_DESTINATIONS : INTERNATIONAL_DESTINATIONS;

  return (
    <section id="destinations" className="py-24 bg-white font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <p className="text-[#8A6E1C] font-semibold tracking-wider text-xs uppercase mb-3">
              Where We Take You
            </p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
              Top Destinations
            </h2>
          </div>

          {/* Destination Tab Toggles */}
          <div className="flex gap-2.5 mt-6 md:mt-0 bg-gray-50 border border-gray-100 p-1.5 rounded-full shrink-0">
            <button
              onClick={() => setActiveTab('india')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'india'
                  ? 'bg-[#16294D] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explore India
            </button>
            <button
              onClick={() => setActiveTab('intl')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'intl'
                  ? 'bg-[#16294D] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Out of India
            </button>
          </div>
        </div>

        {/* Dynamic Destinations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {shownDestinations.map((dest, index) => (
            <div 
              key={index}
              className="relative aspect-[4/5] rounded-[24px] overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-100 flex flex-col justify-end"
            >
              {/* Destination Image */}
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80' }}
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

              {/* Text Info */}
              <div className="relative z-10 p-5 w-full flex justify-between items-end">
                <div className="space-y-0.5">
                  {dest.tag && (
                    <span className="text-gray-300 text-[10px] uppercase font-bold tracking-widest block">
                      {dest.tag}
                    </span>
                  )}
                  <h3 className="text-white font-heading font-bold text-lg leading-tight tracking-tight">
                    {dest.name}
                  </h3>
                </div>

                <a 
                  href="#contact"
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-[#16294D] group-hover:border-[#16294D] transition-all duration-300 hover:scale-105"
                >
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Destinations;
