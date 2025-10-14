import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    image: "https://i.ibb.co.com/1YhxLDf9/Whats-App-Image-2025-10-14-at-14-03-42-f75bfead.jpg",
  },
  {
    image: "https://i.ibb.co.com/v68BJJGh/Whats-App-Image-2025-10-14-at-14-05-24-68af196d.jpg",
  },
  {
    image: "https://i.ibb.co.com/QvKvgHhG/Whats-App-Image-2025-10-14-at-14-03-42-884d45c6.jpg",
  },
];

const BannerSlider = () => {
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
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <motion.div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 5 }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
