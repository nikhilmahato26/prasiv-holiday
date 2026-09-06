'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Shown only when no packages are featured in the admin.
const FALLBACK_SLIDES = [
  {
    kind: 'video',
    id: 'fb-1',
    video: 'https://www.pexels.com/download/video/10513597/',
    poster: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1400&q=85',
    eyebrow: "Discover God's Own Country",
    title: 'Serene\nKerala',
    description: 'Houseboats, Tea Gardens & Backwaters',
    details:
      "Cruise gently through palm-fringed backwater canals on a traditional private houseboat, stroll through Munnar's emerald tea hills, and explore the wildlife trails of Thekkady.",
  },
  {
    kind: 'video',
    id: 'fb-2',
    video: 'https://www.pexels.com/download/video/33333520/',
    poster: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1400&q=85',
    eyebrow: 'Explore Paradise on Earth',
    title: 'Majestic\nKashmir',
    description: 'Snow-Capped Peaks & Scenic Houseboats',
    details:
      "Experience the breathtaking beauty of Srinagar's Dal Lake, the alpine slopes and snow sports of Gulmarg, and the picturesque valleys of Pahalgam.",
  },
  {
    kind: 'video',
    id: 'fb-3',
    video: 'https://www.pexels.com/download/video/34634798/',
    poster: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=1400&q=85',
    eyebrow: 'Land of Legends & Festivals',
    title: 'Vibrant\nGujarat',
    description: 'Spiritual Coastlines & Desert Festivals',
    details:
      'Explore the sacred jyotirlingas of Dwarka and Somnath, marvel at the vast salt desert of the Rann Utsav festival, and see the Asiatic lions in Gir National Park.',
  },
];

const Hero = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [featured, setFeatured] = useState(null); // null = still loading

  useEffect(() => {
    fetch('/api/packages/featured')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setFeatured(Array.isArray(rows) ? rows : []))
      .catch(() => setFeatured([]));
  }, []);

  // Featured packages drive the hero; the video slides are just a fallback.
  const slides =
    featured && featured.length > 0
      ? featured.map((p) => ({
          kind: 'package',
          id: p.id,
          image: p.heroImage || p.image,
          imagePos: p.heroImagePos || p.imagePos || 'center',
          eyebrow: p.destination || 'Featured Journey',
          title: p.title,
          subtitle: p.subtitle,
          href: `/packages/${p.id}`,
        }))
      : FALLBACK_SLIDES;

  const handleSlideChange = (swiper) => {
    const activeSlide = swiper.el.querySelector('.swiper-slide-active');
    if (!activeSlide) return;
    const video = activeSlide.querySelector('video');
    if (video) {
      swiper.autoplay.stop();
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      swiper.autoplay.start();
    }
  };

  const handleVideoEnded = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
      swiperInstance.autoplay.start();
    }
  };

  return (
    <section id="home" className="relative h-screen w-full">
      <Swiper
        key={slides[0]?.id /* re-init when the slide set swaps in */}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
          // Let the first video play fully before advancing.
          if (swiper.realIndex === 0 && slides[0]?.kind === 'video') {
            swiper.autoplay.stop();
          }
        }}
        onSlideChange={handleSlideChange}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        loop={slides.length > 1}
        className="w-full h-full hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background */}
              <div className="absolute inset-0 bg-gray-900">
                {slide.kind === 'video' ? (
                  <video
                    src={slide.video}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster={slide.poster}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{ objectPosition: slide.imagePos }}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&q=85';
                    }}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto pt-20">
                <div className="max-w-xl">
                  {slide.eyebrow && (
                    <h3 className="text-white font-cursive text-xl md:text-2xl mb-3 flex items-center gap-3">
                      <span className="w-10 h-[1px] bg-white inline-block"></span>
                      {slide.eyebrow}
                    </h3>
                  )}

                  <h1 className="text-white font-heading font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 whitespace-pre-line">
                    {slide.title}
                  </h1>

                  {slide.kind === 'video' ? (
                    <div className="mb-7">
                      <h4 className="text-white font-semibold text-base md:text-lg mb-2">
                        {slide.description}
                      </h4>
                      <p className="text-gray-200 text-xs md:text-sm max-w-lg leading-relaxed">
                        {slide.details}
                      </p>
                    </div>
                  ) : (
                    slide.subtitle && (
                      <h4 className="text-white/90 font-medium text-sm md:text-base mb-7 max-w-lg leading-snug">
                        {slide.subtitle}
                      </h4>
                    )
                  )}

                  <div className="flex flex-wrap gap-3">
                    {slide.kind === 'package' ? (
                      <Link
                        href={slide.href}
                        className="bg-[#C9A227] text-[#0E1B33] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#D9B44A] transition-colors shadow-lg"
                      >
                        View Package
                      </Link>
                    ) : (
                      <a
                        href="#packages"
                        className="bg-[#C9A227] text-[#0E1B33] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#D9B44A] transition-colors shadow-lg"
                      >
                        Explore Tours
                      </a>
                    )}
                    <a
                      href="#contact"
                      className="bg-white/20 hover:bg-white text-white hover:text-navy border border-white/40 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        ref={prevRef}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/20 hover:bg-[#C9A227] text-white hover:text-[#0E1B33] hover:border-[#C9A227] flex items-center justify-center transition-all duration-300 shadow-md group"
      >
        <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        ref={nextRef}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/20 hover:bg-[#C9A227] text-white hover:text-[#0E1B33] hover:border-[#C9A227] flex items-center justify-center transition-all duration-300 shadow-md group"
      >
        <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Floating WhatsApp Button (bottom right) */}
      <a
        href="https://wa.me/917796950505?text=Hi%20Prashiv%20Holiday%2C%20I%20want%20to%20plan%20a%20holiday."
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-8 right-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      {/* Custom Styles for Swiper Pagination */}
      <style>{`
        .hero-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: white;
          opacity: 0.5;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #C9A227;
          width: 24px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }
      `}</style>
    </section>
  );
};

export default Hero;
