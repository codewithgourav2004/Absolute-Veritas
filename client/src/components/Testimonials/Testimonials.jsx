import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useFetch } from '../../hooks/useFetch';
import SectionHeader from '../Common/SectionHeader';

const fallback = [
  { _id: 1, name: 'Rajesh Kumar', company: 'TechCorp India', review: 'Absolute Veritas helped us get our BIS certification in record time. Exceptional service!', rating: 5 },
  { _id: 2, name: 'Priya Sharma', company: 'Innovate Electronics', review: 'Their WPC expertise is unmatched. Professional, prompt, and thorough throughout the process.', rating: 5 },
  { _id: 3, name: 'Arun Nair', company: 'Global Devices Ltd', review: 'CE marking with their support was seamless. They truly understand European compliance.', rating: 5 },
];

const Stars = ({ n }) => '★'.repeat(n) + '☆'.repeat(5 - n);

const Testimonials = () => {
  const { data } = useFetch('/testimonials');
  const items = data?.length ? data : fallback;

  return (
    <section className="section-padding bg-indigo">
      <div className="container-max">
        <SectionHeader tag="Client Stories" title="What Our Clients Say" light />
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-10"
        >
          {items.map((t) => (
            <SwiperSlide key={t._id}>
              <div className="glass rounded-2xl p-6 h-full flex flex-col">
                <div className="text-gold text-lg mb-3">{Stars(t.rating || 5)}</div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow mb-4">"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-crimson/30 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.company}</div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
