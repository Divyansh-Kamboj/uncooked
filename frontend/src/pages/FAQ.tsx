import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    // General Questions
    {
      question: "What is Uncooked?",
      answer: "Uncooked is an A Level mathematics learning platform that provides practice questions with AI-powered explanations. We focus on showing you the step-by-step process of solving problems, not just the final answer.",
      category: "General"
    },
    {
      question: "How is Uncooked different from other math resources?",
      answer: "Unlike traditional resources that only show final answers, Uncooked reveals the 'uncooked' thinking process behind each solution. Our AI explanations adapt to your learning style and help you understand the 'why' behind every step.",
      category: "General"
    },
    {
      question: "What A Level subjects do you cover?",
      answer: "We cover Pure Mathematics, Statistics, and Mechanics for A Level. Our question bank includes thousands of carefully curated problems that mirror real exam conditions.",
      category: "General"
    },

    // Subscription & Pricing
    {
      question: "What subscription plans are available?",
      answer: "We offer three plans: Free (limited access), Nerd Tier (₹750/month with daily limits), and Uncooked Tier (₹1,500/month with unlimited access to all features).",
      category: "Subscription"
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through your account settings. Your access will continue until the end of your current billing period.",
      category: "Subscription"
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds for technical issues within 7 days of purchase, duplicate charges, or service unavailability. Please see our Refund Policy for complete details.",
      category: "Subscription"
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a free plan with limited access to questions and explanations. You can upgrade to a paid plan anytime to unlock full features.",
      category: "Subscription"
    },

    // Technical Questions
    {
      question: "What devices and browsers are supported?",
      answer: "Uncooked works on all modern browsers (Chrome, Firefox, Safari, Edge) and is responsive for desktop, tablet, and mobile devices.",
      category: "Technical"
    },
    {
      question: "Do I need to download anything?",
      answer: "No, Uncooked is a web-based platform. You can access it directly through your browser without any downloads or installations.",
      category: "Technical"
    },
    {
      question: "Can I use Uncooked offline?",
      answer: "Currently, Uncooked requires an internet connection to access questions and AI explanations. We're working on offline features for future updates.",
      category: "Technical"
    },
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the sign-in page. You'll receive an email with instructions to create a new password.",
      category: "Technical"
    },

    // Learning & Usage
    {
      question: "How many questions can I practice per day?",
      answer: "Free users have limited daily access. Nerd Tier users get 50 questions per day, while Uncooked Tier users have unlimited access to all questions.",
      category: "Learning"
    },
    {
      question: "Are the questions similar to real A Level exams?",
      answer: "Yes, all our questions are designed to mirror real A Level exam conditions and difficulty levels. They're created by experienced educators familiar with exam patterns.",
      category: "Learning"
    },
    {
      question: "Can I track my progress?",
      answer: "Yes, Uncooked provides detailed progress tracking including topics mastered, questions attempted, and performance analytics to help you identify areas for improvement.",
      category: "Learning"
    },
    {
      question: "How does the AI explanation work?",
      answer: "Our AI analyzes your learning patterns and provides personalized explanations that adapt to your understanding level. It breaks down complex concepts into digestible steps.",
      category: "Learning"
    },

    // Support & Contact
    {
      question: "How can I get help if I'm stuck?",
      answer: "You can contact our support team at uncookeddr@gmail.com or use the live chat feature during business hours. We typically respond within 24 hours.",
      category: "Support"
    },
    {
      question: "Can I share my account with friends?",
      answer: "No, account sharing is not allowed. Each subscription is for individual use only. Sharing accounts violates our Terms of Service.",
      category: "Support"
    },
    {
      question: "What if I find an error in a question?",
      answer: "If you find any errors, please report them to our support team with details about the question and the issue. We appreciate your feedback and will correct errors promptly.",
      category: "Support"
    }
  ];

  const categories = ["General", "Subscription", "Technical", "Learning", "Support"];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
          <h1 className="text-3xl font-bold text-orange-800">Frequently Asked Questions</h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Find Answers to Common Questions</h2>
            <p className="text-gray-600">
              Can't find what you're looking for? <button onClick={() => navigate('/contact')} className="text-orange-600 hover:underline">Contact our support team</button>
            </p>
          </div>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-800 border-b border-orange-200 pb-2">
                  {category} Questions
                </h3>
                <div className="space-y-3">
                  {faqData
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const globalIndex = faqData.findIndex(faq => faq === item);
                      const isOpen = openItems.includes(globalIndex);
                      
                      return (
                        <div key={globalIndex} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-800">{item.question}</span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-orange-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-orange-600" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-orange-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-orange-800 mb-3">Still Have Questions?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you get the most out of Uncooked.
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
