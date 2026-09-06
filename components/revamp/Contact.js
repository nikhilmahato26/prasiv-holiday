'use client'
import { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle, ArrowRight, UserPlus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePhone, usePhone2, useWhatsapp, useEmail, useEmail2 } from '@/hooks/useSettings';
import { usePackages } from '@/hooks/usePackages';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('package');
  const [submitStatus, setSubmitStatus] = useState(null); // 'submitting' | 'success' | 'error'

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#flight') {
        setActiveTab('flight');
      } else if (hash === '#train') {
        setActiveTab('train');
      } else if (hash === '#contact') {
        setActiveTab('package'); // Default contact form is package enquiry
      }
    };

    // Run on initial load
    handleHashChange();

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Settings & Packages
  const phone = usePhone();
  const phone2 = usePhone2();
  const whatsapp = useWhatsapp();
  const emailSettings = useEmail();
  const emailSettings2 = useEmail2();
  const { packages, loaded: packagesLoaded } = usePackages();

  // Unique destinations list extracted dynamically
  const [uniqueDestinations, setUniqueDestinations] = useState([]);
  
  useEffect(() => {
    if (packages && packages.length > 0) {
      const dests = Array.from(new Set(packages.map(p => p.destination))).filter(Boolean).sort();
      setUniqueDestinations(dests);
    }
  }, [packages]);

  // 1. Package Form State
  const [packageForm, setPackageForm] = useState({
    name: '',
    phone: '',
    email: '',
    destination: '',
    packageId: '',
    message: ''
  });
  const [packageTravellers, setPackageTravellers] = useState([
    { name: '', age: '', gender: 'Male' }
  ]);

  // Handle destination change to reset selected package
  const handleDestinationChange = (dest) => {
    setPackageForm(prev => ({
      ...prev,
      destination: dest,
      packageId: '' // reset package selection when destination changes
    }));
  };

  // Get packages for the currently selected destination
  const filteredPackagesForEnquiry = packages.filter(p => p.destination === packageForm.destination);

  // 2. Flight Form State
  const [flightForm, setFlightForm] = useState({
    journeyDate: '',
    fromCity: '',
    toCity: '',
    flightNo: '',
    departureTime: '',
    class: 'Economy',
    tripType: 'One Way',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: ''
  });
  const [flightPassengers, setFlightPassengers] = useState([
    { name: '', age: '', gender: 'Male' }
  ]);

  // 3. Train Form State
  const [trainForm, setTrainForm] = useState({
    fromStation: '',
    toStation: '',
    journeyDate: '',
    trainNo: '',
    class: 'SL',
    quota: 'General',
    contactPhone: '',
    contactAddress: ''
  });
  const [trainPassengers, setTrainPassengers] = useState([
    { name: '', age: '', gender: 'Male', berth: 'No Preference', idCard: '' }
  ]);

  // Helpers to Add/Remove Passengers/Travellers
  const addPackageTraveller = () => {
    if (packageTravellers.length < 9) {
      setPackageTravellers([...packageTravellers, { name: '', age: '', gender: 'Male' }]);
    }
  };
  const removePackageTraveller = (index) => {
    if (packageTravellers.length > 1) {
      setPackageTravellers(packageTravellers.filter((_, i) => i !== index));
    }
  };
  const updatePackageTraveller = (index, field, value) => {
    const updated = [...packageTravellers];
    updated[index][field] = value;
    setPackageTravellers(updated);
  };

  const addFlightPassenger = () => {
    if (flightPassengers.length < 9) {
      setFlightPassengers([...flightPassengers, { name: '', age: '', gender: 'Male' }]);
    }
  };
  const removeFlightPassenger = (index) => {
    if (flightPassengers.length > 1) {
      setFlightPassengers(flightPassengers.filter((_, i) => i !== index));
    }
  };
  const updateFlightPassenger = (index, field, value) => {
    const updated = [...flightPassengers];
    updated[index][field] = value;
    setFlightPassengers(updated);
  };

  const addTrainPassenger = () => {
    if (trainPassengers.length < 6) {
      setTrainPassengers([...trainPassengers, { name: '', age: '', gender: 'Male', berth: 'No Preference', idCard: '' }]);
    }
  };
  const removeTrainPassenger = (index) => {
    if (trainPassengers.length > 1) {
      setTrainPassengers(trainPassengers.filter((_, i) => i !== index));
    }
  };
  const updateTrainPassenger = (index, field, value) => {
    const updated = [...trainPassengers];
    updated[index][field] = value;
    setTrainPassengers(updated);
  };

  // Submit Handlers
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.phone) {
      alert('Please enter your name and phone number.');
      return;
    }
    setSubmitStatus('submitting');

    const selectedPkg = packages.find(p => p.id === packageForm.packageId);
    const pkgTitleText = selectedPkg ? selectedPkg.title : 'Custom Enquiry';

    let travellerListText = '';
    packageTravellers.forEach((p, i) => {
      travellerListText += `${i + 1}. Full Name: ${p.name || 'N/A'} (Age: ${p.age || 'N/A'}, Gender: ${p.gender})\n`;
    });

    const message = `--- PACKAGE ENQUIRY REQUEST ---
Destination: ${packageForm.destination || 'N/A'}
Package Selected: ${pkgTitleText} ${selectedPkg ? `(ID: ${selectedPkg.id})` : ''}

TRAVELLER DETAILS:
${travellerListText}
ADDITIONAL MESSAGE / REQUIREMENTS:
${packageForm.message || 'N/A'}

CONTACT DETAILS:
Name: ${packageForm.name}
Mobile No.: ${packageForm.phone}
Email: ${packageForm.email || 'N/A'}`;

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: packageForm.name,
          phone: packageForm.phone,
          email: packageForm.email,
          type: 'package',
          destination: packageForm.destination || null,
          package_id: packageForm.packageId || null,
          package_title: pkgTitleText,
          message: message
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setPackageForm({ name: '', phone: '', email: '', destination: '', packageId: '', message: '' });
        setPackageTravellers([{ name: '', age: '', gender: 'Male' }]);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    if (!flightForm.contactName || !flightForm.contactPhone) {
      alert('Please enter contact name and mobile number.');
      return;
    }
    setSubmitStatus('submitting');

    // Build Flight Message Copy
    let passengerListText = '';
    flightPassengers.forEach((p, i) => {
      passengerListText += `${i + 1}. Full Name: ${p.name || 'N/A'} (Age: ${p.age || 'N/A'}, Gender: ${p.gender})\n`;
    });

    const message = `--- AIR TICKET BOOKING REQUEST ---
Journey Date: ${flightForm.journeyDate || 'N/A'}
From: ${flightForm.fromCity || 'N/A'}
To: ${flightForm.toCity || 'N/A'}
Flight Name/No.: ${flightForm.flightNo || 'N/A'}
Departure Time: ${flightForm.departureTime || 'N/A'}
Class: ${flightForm.class}
Trip Type: ${flightForm.tripType}

PASSENGER DETAILS:
${passengerListText}
CONTACT DETAILS:
Contact Person Name: ${flightForm.contactName}
Mobile No.: ${flightForm.contactPhone}
Email ID: ${flightForm.contactEmail || 'N/A'}
Address: ${flightForm.contactAddress || 'N/A'}`;

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flightForm.contactName,
          phone: flightForm.contactPhone,
          email: flightForm.contactEmail,
          type: 'flight',
          package_title: 'Flight Ticket Booking',
          message: message
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFlightForm({
          journeyDate: '', fromCity: '', toCity: '', flightNo: '', departureTime: '',
          class: 'Economy', tripType: 'One Way', contactName: '', contactPhone: '',
          contactEmail: '', contactAddress: ''
        });
        setFlightPassengers([{ name: '', age: '', gender: 'Male' }]);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (!trainForm.contactPhone) {
      alert('Please enter a contact mobile number.');
      return;
    }
    setSubmitStatus('submitting');

    // Build Train Message Copy
    let passengerListText = '';
    trainPassengers.forEach((p, i) => {
      passengerListText += `${i + 1}. Name: ${p.name || 'N/A'} (Age: ${p.age || 'N/A'}, Gender: ${p.gender}, Preference: ${p.berth}${p.idCard ? `, ID Card No: ${p.idCard}` : ''})\n`;
    });

    const message = `--- INDIAN RAILWAYS RESERVATION REQUEST ---
From Station: ${trainForm.fromStation || 'N/A'}
To Station: ${trainForm.toStation || 'N/A'}
Journey Date: ${trainForm.journeyDate || 'N/A'}
Train No. & Name: ${trainForm.trainNo || 'N/A'}
Class: ${trainForm.class}
Quota: ${trainForm.quota}

PASSENGER DETAILS:
${passengerListText}
CONTACT DETAILS:
Contact Mobile No.: ${trainForm.contactPhone}
Address: ${trainForm.contactAddress || 'N/A'}`;

    // Set first passenger's name or a default name
    const primaryName = trainPassengers[0].name || 'Railway Reservation Request';

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: primaryName,
          phone: trainForm.contactPhone,
          type: 'train',
          package_title: 'Train Ticket Booking',
          message: message
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setTrainForm({
          fromStation: '', toStation: '', journeyDate: '', trainNo: '',
          class: 'SL', quota: 'General', contactPhone: '', contactAddress: ''
        });
        setTrainPassengers([{ name: '', age: '', gender: 'Male', berth: 'No Preference', idCard: '' }]);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 bg-white font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Info (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            <div>
              <p className="text-[#8A6E1C] font-semibold tracking-wider text-xs uppercase mb-3">
                Get In Touch
              </p>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-[1.2] mb-6">
                Plan Your Dream Journey Today
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Whether you need a custom holiday package, domestic or international flight tickets, or railway reservations, we handle all the paperwork and planning. Select the service you need in the form to get started.
              </p>
            </div>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="bg-[#EEF2F8] p-3.5 rounded-xl text-[#16294D] flex-shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Phone Number</span>
                  <a href={`tel:+${phone}`} className="text-gray-800 text-sm font-bold hover:text-[#16294D] transition-colors block">
                    +{phone.substring(0,2)} {phone.substring(2,7)} {phone.substring(7)}
                  </a>
                  {phone2 && phone2 !== phone && (
                    <a href={`tel:+${phone2}`} className="text-gray-800 text-sm font-bold hover:text-[#16294D] transition-colors block">
                      +{phone2.substring(0,2)} {phone2.substring(2,7)} {phone2.substring(7)}
                    </a>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="bg-[#EEF2F8] p-3.5 rounded-xl text-[#16294D] flex-shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Email Address</span>
                  <a href={`mailto:${emailSettings}`} className="text-gray-800 text-sm font-bold hover:text-[#16294D] transition-colors block">
                    {emailSettings}
                  </a>
                  {emailSettings2 && emailSettings2 !== emailSettings && (
                    <a href={`mailto:${emailSettings2}`} className="text-gray-800 text-sm font-bold hover:text-[#16294D] transition-colors block mt-1">
                      {emailSettings2}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href={`https://wa.me/${whatsapp}?text=Hi%20Prashiv%20Holiday%2C%20I%20want%20to%20plan%20a%20holiday.`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <MessageCircle size={20} className="fill-current" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            
            {/* Tabs for Forms */}
            <div className="flex border-b border-gray-200 mb-8 gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                id="package"
                onClick={() => { setActiveTab('package'); setSubmitStatus(null); }}
                className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'package' ? 'border-[#16294D] text-[#16294D]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Package Enquiry
              </button>
              <button
                id="flight"
                onClick={() => { setActiveTab('flight'); setSubmitStatus(null); }}
                className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'flight' ? 'border-[#16294D] text-[#16294D]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Flight Booking
              </button>
              <button
                id="train"
                onClick={() => { setActiveTab('train'); setSubmitStatus(null); }}
                className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'train' ? 'border-[#16294D] text-[#16294D]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Train Booking
              </button>
            </div>

            {/* Submission Alerts */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Request Sent Successfully!</h4>
                  <p className="text-xs text-green-700 mt-1">Our travel experts will contact you shortly. Thank you!</p>
                </div>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-[#EEF2F8] border border-[#C3D0E4] text-[#0E1B33] rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="text-[#2F5490] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Submission Failed</h4>
                  <p className="text-xs text-[#0E1B33] mt-1">There was a problem submitting your request. Please try again or contact us directly.</p>
                </div>
              </div>
            )}

            {/* 1. PACKAGE ENQUIRY FORM */}
            {activeTab === 'package' && (
              <form onSubmit={handlePackageSubmit} className="space-y-6">
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                  Contact Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="Contact Name" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={packageForm.phone}
                      onChange={(e) => setPackageForm({ ...packageForm, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={packageForm.email}
                    onChange={(e) => setPackageForm({ ...packageForm, email: e.target.value })}
                    placeholder="your@email.com" 
                    className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                  />
                </div>

                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4">
                  Destination & Tour Package
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Select Destination *</label>
                    <select
                      required
                      value={packageForm.destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    >
                      <option value="">-- Select Destination State --</option>
                      {uniqueDestinations.map((dest) => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Select Package *</label>
                    <select
                      required
                      disabled={!packageForm.destination}
                      value={packageForm.packageId}
                      onChange={(e) => setPackageForm({ ...packageForm, packageId: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors disabled:opacity-50"
                    >
                      <option value="">-- Select Package --</option>
                      {filteredPackagesForEnquiry.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.duration})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Package Travellers Details Section */}
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4 flex items-center justify-between">
                  <span>Traveller Details</span>
                  <button 
                    type="button"
                    onClick={addPackageTraveller}
                    disabled={packageTravellers.length >= 9}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <UserPlus size={14} />
                    Add Traveller (Max 9)
                  </button>
                </div>

                <div className="space-y-4">
                  {packageTravellers.map((traveller, idx) => (
                    <div key={idx} className="bg-white p-4 border border-gray-200/80 rounded-2xl relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Traveller #{idx + 1}</span>
                        {packageTravellers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePackageTraveller(idx)}
                            className="text-[#2F5490] hover:text-[#0E1B33] cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <input 
                            type="text" 
                            required
                            value={traveller.name}
                            onChange={(e) => updatePackageTraveller(idx, 'name', e.target.value)}
                            placeholder="Full Name" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <input 
                            type="number" 
                            required
                            min="0"
                            max="120"
                            value={traveller.age}
                            onChange={(e) => updatePackageTraveller(idx, 'age', e.target.value)}
                            placeholder="Age" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <select
                            value={traveller.gender}
                            onChange={(e) => updatePackageTraveller(idx, 'gender', e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Additional Message / Special Requirements</label>
                  <textarea 
                    rows="4" 
                    value={packageForm.message}
                    onChange={(e) => setPackageForm({ ...packageForm, message: e.target.value })}
                    placeholder="Enter details like dates of travel, food preferences, hotel ratings..." 
                    className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitStatus === 'submitting'}
                  className="w-full bg-[#16294D] hover:bg-[#0E1B33] text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitStatus === 'submitting' ? 'Sending...' : 'Send Package Enquiry'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* 2. AIR TICKET BOOKING FORM */}
            {activeTab === 'flight' && (
              <form onSubmit={handleFlightSubmit} className="space-y-6">
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                  Flight Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Journey Date *</label>
                    <input 
                      type="date" 
                      required
                      value={flightForm.journeyDate}
                      onChange={(e) => setFlightForm({ ...flightForm, journeyDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Trip Type</label>
                    <div className="flex gap-4 py-2.5">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="tripType"
                          checked={flightForm.tripType === 'One Way'}
                          onChange={() => setFlightForm({ ...flightForm, tripType: 'One Way' })}
                          className="accent-[#16294D]"
                        />
                        One Way
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="tripType"
                          checked={flightForm.tripType === 'Round Trip'}
                          onChange={() => setFlightForm({ ...flightForm, tripType: 'Round Trip' })}
                          className="accent-[#16294D]"
                        />
                        Round Trip
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">From City/Airport *</label>
                    <input 
                      type="text" 
                      required
                      value={flightForm.fromCity}
                      onChange={(e) => setFlightForm({ ...flightForm, fromCity: e.target.value })}
                      placeholder="Origin City/Airport" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">To City/Airport *</label>
                    <input 
                      type="text" 
                      required
                      value={flightForm.toCity}
                      onChange={(e) => setFlightForm({ ...flightForm, toCity: e.target.value })}
                      placeholder="Destination City/Airport" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Flight Name/No.</label>
                    <input 
                      type="text" 
                      value={flightForm.flightNo}
                      onChange={(e) => setFlightForm({ ...flightForm, flightNo: e.target.value })}
                      placeholder="e.g. AI 101" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Preferred Dep. Time</label>
                    <input 
                      type="text" 
                      value={flightForm.departureTime}
                      onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                      placeholder="e.g. 10:00 AM" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Class</label>
                    <select
                      value={flightForm.class}
                      onChange={(e) => setFlightForm({ ...flightForm, class: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    >
                      <option>Economy</option>
                      <option>Premium Economy</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>

                {/* Flight Passengers Section */}
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4 flex items-center justify-between">
                  <span>Passenger Details</span>
                  <button 
                    type="button"
                    onClick={addFlightPassenger}
                    disabled={flightPassengers.length >= 9}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <UserPlus size={14} />
                    Add (Max 9)
                  </button>
                </div>

                <div className="space-y-4">
                  {flightPassengers.map((passenger, idx) => (
                    <div key={idx} className="bg-white p-4 border border-gray-200/80 rounded-2xl relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Passenger #{idx + 1}</span>
                        {flightPassengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFlightPassenger(idx)}
                            className="text-[#2F5490] hover:text-[#0E1B33] cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <input 
                            type="text" 
                            required
                            value={passenger.name}
                            onChange={(e) => updateFlightPassenger(idx, 'name', e.target.value)}
                            placeholder="Full Name" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <input 
                            type="number" 
                            required
                            min="0"
                            max="120"
                            value={passenger.age}
                            onChange={(e) => updateFlightPassenger(idx, 'age', e.target.value)}
                            placeholder="Age" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <select
                            value={passenger.gender}
                            onChange={(e) => updateFlightPassenger(idx, 'gender', e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4">
                  Contact & Communication Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Contact Person Name *</label>
                    <input 
                      type="text" 
                      required
                      value={flightForm.contactName}
                      onChange={(e) => setFlightForm({ ...flightForm, contactName: e.target.value })}
                      placeholder="Contact Name" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={flightForm.contactPhone}
                      onChange={(e) => setFlightForm({ ...flightForm, contactPhone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Email ID</label>
                    <input 
                      type="email" 
                      value={flightForm.contactEmail}
                      onChange={(e) => setFlightForm({ ...flightForm, contactEmail: e.target.value })}
                      placeholder="your@email.com" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Address</label>
                    <input 
                      type="text" 
                      value={flightForm.contactAddress}
                      onChange={(e) => setFlightForm({ ...flightForm, contactAddress: e.target.value })}
                      placeholder="Full Address" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitStatus === 'submitting'}
                  className="w-full bg-[#16294D] hover:bg-[#0E1B33] text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitStatus === 'submitting' ? 'Sending...' : 'Request Flight Booking'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* 3. INDIAN RAILWAYS RESERVATION FORM */}
            {activeTab === 'train' && (
              <form onSubmit={handleTrainSubmit} className="space-y-6">
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                  Train Journey Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">From Station *</label>
                    <input 
                      type="text" 
                      required
                      value={trainForm.fromStation}
                      onChange={(e) => setTrainForm({ ...trainForm, fromStation: e.target.value })}
                      placeholder="Origin Station" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">To Station *</label>
                    <input 
                      type="text" 
                      required
                      value={trainForm.toStation}
                      onChange={(e) => setTrainForm({ ...trainForm, toStation: e.target.value })}
                      placeholder="Destination Station" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Journey Date *</label>
                    <input 
                      type="date" 
                      required
                      value={trainForm.journeyDate}
                      onChange={(e) => setTrainForm({ ...trainForm, journeyDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Train No. & Name</label>
                    <input 
                      type="text" 
                      value={trainForm.trainNo}
                      onChange={(e) => setTrainForm({ ...trainForm, trainNo: e.target.value })}
                      placeholder="e.g. 12952 Mumbai Rajdhani" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2 font-bold">Class</label>
                    <div className="flex flex-wrap gap-2.5 py-1">
                      {['SL', '3A', '2A', '1A', 'CC', '2S', 'EC'].map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setTrainForm({ ...trainForm, class: cls })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            trainForm.class === cls
                              ? 'bg-[#16294D] border-[#16294D] text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2 font-bold">Quota</label>
                    <div className="flex flex-wrap gap-2.5 py-1">
                      {['General', 'Tatkal', 'Senior Citizen', 'Other'].map((qut) => (
                        <button
                          key={qut}
                          type="button"
                          onClick={() => setTrainForm({ ...trainForm, quota: qut })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            trainForm.quota === qut
                              ? 'bg-[#16294D] border-[#16294D] text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {qut}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Train Passengers Section */}
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4 flex items-center justify-between">
                  <span>Passenger Details</span>
                  <button 
                    type="button"
                    onClick={addTrainPassenger}
                    disabled={trainPassengers.length >= 6}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <UserPlus size={14} />
                    Add (Max 6)
                  </button>
                </div>

                <div className="space-y-4">
                  {trainPassengers.map((passenger, idx) => (
                    <div key={idx} className="bg-white p-4 border border-gray-200/80 rounded-2xl relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Passenger #{idx + 1}</span>
                        {trainPassengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTrainPassenger(idx)}
                            className="text-[#2F5490] hover:text-[#0E1B33] cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                          <input 
                            type="text" 
                            required
                            value={passenger.name}
                            onChange={(e) => updateTrainPassenger(idx, 'name', e.target.value)}
                            placeholder="Name" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input 
                            type="number" 
                            required
                            min="0"
                            max="120"
                            value={passenger.age}
                            onChange={(e) => updateTrainPassenger(idx, 'age', e.target.value)}
                            placeholder="Age" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <select
                            value={passenger.gender}
                            onChange={(e) => updateTrainPassenger(idx, 'gender', e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <select
                            value={passenger.berth}
                            onChange={(e) => updateTrainPassenger(idx, 'berth', e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          >
                            <option>No Preference</option>
                            <option>Lower</option>
                            <option>Middle</option>
                            <option>Upper</option>
                            <option>Side Lower</option>
                            <option>Side Upper</option>
                          </select>
                        </div>
                      </div>

                      {/* ID Card for Passenger 1 */}
                      {idx === 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          <label className="text-gray-500 text-[10px] font-bold uppercase block">ID Card / Proof No. (Required for Primary Passenger)</label>
                          <input 
                            type="text" 
                            required
                            value={passenger.idCard}
                            onChange={(e) => updateTrainPassenger(idx, 'idCard', e.target.value)}
                            placeholder="Aadhaar / Voter ID / Passport Number" 
                            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#16294D] transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div className="text-xs font-bold text-[#16294D] uppercase tracking-wider border-b border-gray-200 pb-2 pt-4">
                  Contact & Address Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Contact Mobile No. *</label>
                    <input 
                      type="tel" 
                      required
                      value={trainForm.contactPhone}
                      onChange={(e) => setTrainForm({ ...trainForm, contactPhone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Address</label>
                    <input 
                      type="text" 
                      value={trainForm.contactAddress}
                      onChange={(e) => setTrainForm({ ...trainForm, contactAddress: e.target.value })}
                      placeholder="Full Address" 
                      className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#16294D] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitStatus === 'submitting'}
                  className="w-full bg-[#16294D] hover:bg-[#0E1B33] text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitStatus === 'submitting' ? 'Sending...' : 'Request Train Reservation'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
