'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Twitter, Linkedin } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Navbar from '../components/Navbar'
import '../app/globals.css'

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const testimonials = [
    { name: 'John Doe', text: 'This platform has revolutionized how we manage our projects.' },
    { name: 'Jane Smith', text: 'Intuitive design and powerful features. Highly recommended!' },
    { name: 'Alex Johnson', text: 'The best productivity tool we\'ve ever used. Simply amazing.' },
  ]

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-16 pt-24">
        <motion.section
          className="text-center mb-20"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-800"
            variants={fadeInUp}
          >
            Think, plan, and track
          </motion.h1>
          <motion.h2
            className="text-2xl md:text-3xl mb-4 text-gray-500"
            variants={fadeInUp}
          >
            all in one place
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-gray-600"
            variants={fadeInUp}
          >
            Efficiently manage your tasks and boost productivity.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md text-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Get free demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {[
            { title: 'Plan', image: '/sticky-note.png', description: 'Plan tasks in easy drag-and-drop boards' },
            { title: 'Track', image: '/task-list.png', description: 'Today\'s tasks' },
            { title: 'Integrate', image: '/integrations.png', description: '100+ integrations' }
          ].map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-700">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Image src={feature.image} alt={feature.title} width={100} height={100} />
                  <p className="text-gray-600 mt-4">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">What Our Customers Say</h2>
          <Carousel
            setApi={(api) => {
              api?.on('select', () => {
                setCurrentTestimonial(api.selectedScrollSnap())
              })
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="bg-white p-6 text-center">
                    <CardContent>
                      <p className="text-gray-600 mb-4">&quot;{testimonial.text}&quot;</p>
                      <p className="font-semibold text-gray-700">{testimonial.name}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      </main>

      <footer className="bg-gradient-to-t from-gray-200 to-gray-100 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">&copy; 2024 Hackathon Finder. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
              <Github size={24} />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
              <Twitter size={24} />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
