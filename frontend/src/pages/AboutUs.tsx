import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold text-orange-800">About Us</h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-orange-800 mb-4">🔥 Uncooked</h2>
            <p className="text-xl text-orange-600">Your A Level answers, uncooked and explained.</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">Our Mission</h3>
              <p className="text-lg leading-relaxed">
                At Uncooked, we believe that every A Level student deserves access to clear, 
                comprehensive explanations that go beyond just the final answer. Our mission is 
                to transform the way students learn mathematics by providing step-by-step 
                solutions enhanced with AI-powered explanations that make complex concepts 
                accessible and understandable.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">What Makes Us Different</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-orange-800 mb-3">🔥 Uncooked Approach</h4>
                  <p>
                    We don't just give you the answer - we show you the raw, unfiltered 
                    process of solving problems. Our "uncooked" methodology reveals the 
                    thinking behind each step.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-orange-800 mb-3">🤖 AI-Powered Explanations</h4>
                  <p>
                    Advanced AI technology provides personalized explanations that adapt 
                    to your learning style and help you understand the "why" behind every solution.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-orange-800 mb-3">📚 Comprehensive Coverage</h4>
                  <p>
                    From Pure Mathematics to Statistics and Mechanics, we cover all A Level 
                    topics with thousands of carefully curated questions and solutions.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-orange-800 mb-3">🎯 Exam-Focused</h4>
                  <p>
                    Every question is designed to mirror real exam conditions, helping you 
                    build confidence and improve your performance when it matters most.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">Our Story</h3>
              <p className="text-lg leading-relaxed">
                Uncooked was born from the frustration of students who found traditional 
                math resources too rigid and unhelpful. We recognized that students needed 
                more than just answers - they needed to understand the journey to get there. 
                Our platform combines the expertise of experienced educators with cutting-edge 
                AI technology to create a learning experience that's both effective and engaging.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">Join the Revolution</h3>
              <p className="text-lg leading-relaxed">
                Whether you're struggling with complex mathematical concepts or looking to 
                excel in your A Level exams, Uncooked is here to support your learning journey. 
                Join thousands of students who have transformed their understanding of mathematics 
                with our innovative approach.
              </p>
              <div className="text-center mt-6">
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                >
                  Start Your Journey
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
