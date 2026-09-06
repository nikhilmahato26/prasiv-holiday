import { 
  Users, 
  Briefcase, 
  Plane, 
  Train, 
  Bed, 
  Car, 
  Compass, 
  MapPin, 
  Heart, 
  Sparkles, 
  Sun 
} from 'lucide-react';

const SERVICES = [
  { name: 'Group Tours', icon: Users, desc: 'Fun-filled curated tours for like-minded groups.' },
  { name: 'Corporate Tours', icon: Briefcase, desc: 'Seamless travel management for MICE & team events.' },
  { name: 'Flight Booking', icon: Plane, desc: 'Best deals on domestic and international air ticketing.' },
  { name: 'Railway Reservation', icon: Train, desc: 'Hassle-free train bookings & route planning.' },
  { name: 'Hotel Booking', icon: Bed, desc: 'Selected stays across budgets with premium support.' },
  { name: 'Car Rental', icon: Car, desc: 'Reliable private vehicles & professional drivers.' },
  { name: 'Customized Holidays', icon: Compass, desc: 'Bespoke itineraries tailored to your preferences.' },
  { name: 'Domestic Tour Packages', icon: MapPin, desc: 'Handpicked tours across all regions of India.' },
  { name: 'Family Holidays', icon: Heart, desc: 'Unforgettable, relaxed vacations for the whole family.' },
  { name: 'Honeymoon Tours', icon: Sparkles, desc: 'Romantic getaways designed for memorable moments.' },
  { name: 'Pilgrimage Tours', icon: Sun, desc: 'Spiritual journeys & visits to sacred shrines.' },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-gray-50 font-body border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#8A6E1C] font-semibold tracking-wider text-xs uppercase mb-3">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            From flights and train bookings to customized domestic packages and car rentals, we provide end-to-end travel assistance.
          </p>
        </div>

        {/* Small Cute Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {SERVICES.map((srv, index) => {
            const Icon = srv.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group cursor-default"
              >
                {/* Icon Container */}
                <div className="w-12 h-12 bg-[#EEF2F8] text-[#16294D] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#16294D] group-hover:text-white transition-colors duration-300">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                
                {/* Title */}
                <h4 className="font-heading font-bold text-gray-900 text-sm md:text-base mb-1 tracking-tight leading-tight group-hover:text-[#16294D] transition-colors">
                  {srv.name}
                </h4>
                
                {/* Short Desc */}
                <p className="text-gray-400 text-[10px] leading-normal mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {srv.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Services;
