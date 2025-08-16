import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    
    try {
      // EmailJS configuration
      const templateParams = {
        user_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        user_email: formData.get('email'),
        user_subject: formData.get('subject'),
        user_message: formData.get('message'),
      };

      // Get EmailJS credentials from environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS credentials not configured');
      }

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      if (response.status === 200) {
        setSubmitStatus('success');
        // Reset form
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4 h-10 w-10 rounded-full bg-white/50 hover:bg-white/70 text-orange-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-orange-800">Contact Us</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-6">Get in Touch</h2>
            <p className="text-gray-700 mb-8">
              Have questions about Uncooked? We're here to help! Reach out to us and we'll 
              get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Email Support</h3>
                  <p className="text-gray-600">uncookeddr@gmail.com</p>
                  <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Live Chat</h3>
                  <p className="text-gray-600">Available during business hours</p>
                  <p className="text-sm text-gray-500">Get instant help with your questions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p className="text-sm text-gray-500">Weekend support available for urgent issues</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Before You Contact Us</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check our <button onClick={() => navigate('/faq')} className="text-orange-600 hover:underline">FAQ page</button> for quick answers</li>
                <li>• For technical issues, include your browser and device information</li>
                <li>• For billing questions, have your subscription details ready</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-6">Send Us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Message sent successfully!</p>
                <p className="text-green-700 text-sm mt-1">We'll get back to you within 24 hours.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">❌ Failed to send message</p>
                <p className="text-red-700 text-sm mt-1">Please try again or email us directly at uncookeddr@gmail.com</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-black">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="bg-gray-100 border border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-none outline-none ring-0 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-black">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="bg-gray-100 border border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-none outline-none ring-0 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-black">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-gray-100 border border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-none outline-none ring-0 text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-black">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  className="bg-gray-100 border border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-none outline-none ring-0 text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-black">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="bg-gray-100 border border-gray-300 focus:border-orange-500 focus:ring-orange-500 shadow-none outline-none ring-0 text-gray-900"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Or email us directly at{' '}
                <a 
                  href="mailto:uncookeddr@gmail.com" 
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  uncookeddr@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
