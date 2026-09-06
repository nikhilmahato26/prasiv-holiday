import { ArrowRight, CheckCircle2, Award, Users, Target, ShieldCheck } from 'lucide-react';

const About = () => {
  const expertiseItems = [
    'Domestic & International Flight Tickets',
    'Affordable Airfares & Special Fares',
    'Customized Tour Packages (Group & Family)',
    'Railway Tour Planning & Bookings',
    'Complete Holiday & Hotel Arrangements',
    'Personalized Travel Assistance'
  ];

  return (
    <section id="about" className="py-24 bg-white font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          
          {/* Images Section */}
          <div className="relative w-full h-[520px]">
            {/* Top Large Image */}
            <div className="absolute top-0 left-0 w-[95%] h-[55%] rounded-3xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Kerala Backwaters Houseboat" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Bottom Left Image */}
            <div className="absolute bottom-0 left-0 w-[45%] h-[40%] rounded-3xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Indian Temple Scenic View" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Bottom Right Image */}
            <div className="absolute bottom-0 right-[5%] w-[45%] h-[40%] rounded-3xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
                alt="Travellers exploring nature" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-8 pl-4 lg:pl-8">
            <div>
              <p className="text-[#8A6E1C] font-semibold tracking-wider text-xs uppercase mb-3">
                About PRASHIV HOLIDAY
              </p>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-[1.25] mb-6">
                Your Journey,<br />Our Responsibility
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                <strong>Prashiv Holiday</strong> is a trusted and customer-focused travel company. We are dedicated to making every journey smooth, comfortable, affordable, and memorable. We specialize in Domestic &amp; International Air Ticketing, Tour Packages, Railway Tour Planning, Customized Holidays, and Complete Travel Planning.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                We have built our journey on the foundation of trust, personalized service, and customer satisfaction — planning each trip around what the traveller actually needs, and staying reachable from the first enquiry through to the return journey.
              </p>
            </div>

            {/* Stats Callouts */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="text-[#16294D] mb-2 flex items-center gap-2">
                  <Award size={22} />
                  <span className="font-heading font-bold text-2xl">15+ Years</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Industry experience delivering trust & satisfaction</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="text-[#16294D] mb-2 flex items-center gap-2">
                  <Users size={22} />
                  <span className="font-heading font-bold text-2xl">25,000+</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Satisfied customers happily served</p>
              </div>
            </div>

            <div className="pt-2 text-gray-500 text-sm italic">
              "Their trust and continued support are our greatest achievements and the motivation behind everything we do."
            </div>
          </div>

        </div>

        {/* Vision, Expertise & Commitment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 border-t border-gray-100">
          
          {/* Card 1: Our Expertise */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#EEF2F8] text-[#16294D] rounded-2xl flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-xl mb-4">Our Expertise</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                At Prashiv Holiday, we understand that every traveller has different needs, preferences, and budgets. Our key areas include:
              </p>
              <div className="space-y-3">
                {expertiseItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-gray-600 text-sm">
                    <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Our Vision */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#EEF2F8] text-[#16294D] rounded-2xl flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-xl mb-4">Our Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Our vision is to establish Prashiv Holiday as a trusted and respected name in the tourism and travel industry, known for quality service, honest guidance, competitive pricing, and customer satisfaction.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                We continuously strive to provide the best possible service to every customer and create travel experiences that they can remember and cherish.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-50 mt-6 text-gray-500 text-xs">
              Quality · Honest Guidance · Best Pricing
            </div>
          </div>

          {/* Card 3: Our Commitment */}
          <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-4">Our Commitment</h3>
              <p className="text-gray-200 text-sm leading-relaxed mb-6">
                For us, every booking represents a relationship built on trust. We believe in giving our 100% best in every package and every service, while maintaining transparency and putting our customers' interests first.
              </p>
            </div>

            {/* Tagline Callout */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 mt-6 space-y-2">
              <div className="text-xs tracking-widest text-[#C9A227] font-bold uppercase">PRASHIV HOLIDAY</div>
              <p className="font-heading font-bold text-sm text-white">
                Plan Better. Travel Better. Travel With Confidence.
              </p>
              <p className="text-gray-300 text-xs">Your journey matters to us — we make it memorable.</p>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-16">
          <a href="#contact" className="inline-flex items-center gap-2 bg-[#16294D] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0E1B33] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Plan Your Journey With Us
            <ArrowRight size={18} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default About;
