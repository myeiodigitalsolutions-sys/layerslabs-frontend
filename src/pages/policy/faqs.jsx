import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQsPage() {
  const faqs = [
    {
      question: "What materials do you use for 3D printing?",
      answer: "We use high-quality PLA, resin, and other premium filaments, followed by expert hand-painting for vibrant finishes."
    },
    {
      question: "How long does it take to receive my order?",
      answer: "Processing takes 3-7 days, plus shipping time (5-10 days in India). Limited editions may take longer."
    },
    {
      question: "Are the collectibles fragile?",
      answer: "They are durable for display but handle with care as they are handmade. Avoid direct sunlight to preserve colors."
    },
    {
      question: "Do you ship internationally?",
      answer: "Limited international shipping is available. Contact us for details and quotes."
    },
    {
      question: "What is your return policy?",
      answer: "Defective items can be returned within 14 days. Custom pieces are non-returnable unless faulty."
    },
    {
      question: "Are these official licensed products?",
      answer: "Our collectibles are original designs or fan-inspired creations crafted with passion."
    },
    {
      question: "Can I request custom designs?",
      answer: "Yes! Contact us with your ideas for custom quotes."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto">
            Everything you need to know about Layer Labs collectibles.
          </p>
        </section>

        {/* FAQs Accordion */}
        <section className="py-16 bg-white rounded-3xl shadow-2xl px-8 sm:px-12">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left flex justify-between items-center py-4"
                >
                  <h3 className="text-2xl font-bold text-gray-800">{faq.question}</h3>
                  <ChevronDown className={`w-8 h-8 text-pink-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === index && (
                  <p className="text-lg text-gray-600 mt-4">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}