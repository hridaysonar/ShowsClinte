import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ShoppingBag, Truck, Heart, Star, DollarSign, Shield } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    image: "https://i.ibb.co.com/fmz69K7/Professional-E-Commerce-Shoes-Banner-Design-1180x664.jpg",
    title: "Step into Style – Redefine Your Walk",
    offer: "Exclusive Discounts Up to 40%",
    delivery: "Fast Delivery All Over Bangladesh",
    comfort: "Soft, Breathable & Long-lasting",
    feature: "New Arrivals in Trend",
    buttonLabel: "Shop Now",
  },
  {
    image: "https://i.ibb.co.com/nstC5JpZ/2bbcfa99737217-5ef9be3dbb9a9.jpg",
    title: "Luxury Shoes for Every Step You Take",
    offer: "Premium Leather Collections",
    delivery: "Free Home Delivery",
    comfort: "Designed for All-day Comfort",
    feature: "Limited Edition Styles",
    buttonLabel: "Explore Collection",
  },
  {
    image: "https://i.ibb.co.com/gLWTnR1r/advertising-web-banner-design-with-discount-offer-on-brown-abstract-background-for-running-shoes-vec.jpg",
    title: "Run Faster, Feel Better – Be Unstoppable",
    offer: "Up to 30% Off on Sports Shoes",
    delivery: "COD Available Nationwide",
    comfort: "Lightweight & Breathable Design",
    feature: "Engineered for Performance",
    buttonLabel: "Buy Now",
  },
];

const BannerSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full h-[50vh] sm:h-[65vh] md:h-[80vh] relative mt-6 sm:mt-10">
      <style>
        {`
          .swiper-pagination-bullet {
            background: #14b8a6;
            opacity: 0.7;
          }
          .swiper-pagination-bullet-active {
            background: #059669;
            opacity: 1;
          }
          .swiper-button-prev, .swiper-button-next {
            color: #14b8a6;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 38px;
            height: 38px;
            transition: background 0.3s;
          }
          .swiper-button-prev:hover, .swiper-button-next:hover {
            background: rgba(255, 255, 255, 0.6);
          }
          .swiper-button-prev:after, .swiper-button-next:after {
            font-size: 18px;
          }
        `}
      </style>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation
        className="h-full rounded-3xl overflow-hidden"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <motion.div
              className="w-full h-full bg-cover bg-center flex items-center justify-center relative"
              style={{ backgroundImage: `url(${slide.image})` }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 5 }}
            >
              <div className="absolute inset-0 bg-black/60" />

              <AnimatePresence mode="wait">
                {activeIndex === idx && (
                  <motion.div
                    key={idx}
                    className="relative bg-white/85 backdrop-blur-md mx-3 sm:mx-6 md:mx-10 p-5 sm:p-8 md:p-10 rounded-2xl lg:w-9/12 xl:w-7/12 text-gray-900 border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Title */}
                    <div className="flex items-center gap-3 text-gray-900 text-lg sm:text-2xl md:text-3xl font-extrabold mb-4 sm:mb-6">
                      <ShoppingBag className="text-teal-500 w-6 h-6 sm:w-8 sm:h-8" />
                      <h2>
                        <Typewriter
                          words={[slide.title]}
                          loop={1}
                          cursor
                          cursorStyle="|"
                          typeSpeed={55}
                          deleteSpeed={30}
                          delaySpeed={1000}
                        />
                      </h2>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-400 w-5 h-5" />
                        <span>
                          <strong>Offer:</strong> {slide.offer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="text-blue-400 w-5 h-5" />
                        <span>
                          <strong>Delivery:</strong> {slide.delivery}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="text-pink-400 w-5 h-5" />
                        <span>
                          <strong>Comfort:</strong> {slide.comfort}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="text-green-500 w-5 h-5" />
                        <span>
                          <strong>Feature:</strong> {slide.feature}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-emerald-500 w-5 h-5" />
                        <span>
                          <strong>Quality:</strong> Guaranteed Value
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="text-teal-500 w-5 h-5" />
                        <span>
                          <strong>Store:</strong> Style Shoe Hub BD
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                      Discover premium shoes crafted for comfort, fashion, and
                      durability. From casual wear to sports gear, we make every
                      step stylish and confident.
                    </p>

                    <motion.button
                      className="mt-5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(20,184,166,0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {slide.buttonLabel}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
