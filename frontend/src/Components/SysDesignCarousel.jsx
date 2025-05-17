import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cards = [
  {
    title: "Topic 1",
    image: "/assets/load-balancer.png",
    description: "Distributes incoming traffic across multiple servers.",
  },
  {
    title: "Topic 2",
    image: "/assets/cdn.png",
    description: "Delivers content quickly using edge locations.",
  },
  {
    title: "Topic 3",
    image: "/assets/sharding.png",
    description: "Splits data across databases for scalability.",
  },
  {
    title: "Topic 4",
    image: "/assets/caching.png",
    description: "Stores frequent data for faster access.",
  },
];

export default function SystemDesignCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = cards[index];

  return (
    <div className="max-w-md mx-auto mt-10 relative h-72">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.3 }}
          className="absolute w-full h-full bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-16 h-16 mb-4"
          />
          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-sm text-center">{current.description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
