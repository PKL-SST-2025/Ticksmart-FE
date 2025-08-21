// src/pages/ContactUs.tsx
import { Component, createSignal } from "solid-js";
import MainLayout from "../layouts/MainLayout"; // Assuming you have this layout

const ContactUs: Component = () => {
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [submissionStatus, setSubmissionStatus] = createSignal<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: Event) => {
    event.preventDefault(); // Prevent default form submission
    setSubmissionStatus("submitting");

    // --- Placeholder for actual API call ---
    // In a real application, you would send this data to your backend,
    // a service like Formspree, Netlify Forms, or a custom API endpoint.
    console.log("Submitting form with data:", {
      name: name(),
      email: email(),
      subject: subject(),
      message: message(),
    });

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

      // Simulate success or error based on some condition (e.g., random chance, or form data)
      const success = Math.random() > 0.2; // 80% success rate for demo

      if (success) {
        setSubmissionStatus("success");
        // Optionally clear the form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setSubmissionStatus("error");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      setSubmissionStatus("error");
    }
  };

  return (
    <MainLayout>
      <section class="bg-slate-950 text-gray-200 py-20 md:py-28 px-4">
        <div class="max-w-3xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl shadow-black/20">
          <h1 class="text-center text-4xl md:text-5xl font-extrabold mb-6 text-white">
            Get In Touch
          </h1>
          <p class="text-lg text-slate-300 text-center mb-10 leading-relaxed">
            Have questions, feedback, or just want to say hello? Fill out the form below, and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-200 mb-2">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-200 mb-2">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label for="subject" class="block text-sm font-medium text-slate-200 mb-2">Subject (Optional)</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={subject()}
                onInput={(e) => setSubject(e.currentTarget.value)}
                class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Regarding a feature request..."
              />
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-slate-200 mb-2">Your Message</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={message()}
                onInput={(e) => setMessage(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                placeholder="Type your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submissionStatus() === "submitting"}
              class="w-full inline-flex items-center cursor-pointer justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submissionStatus() === "submitting" ? (
                <>
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>

            {submissionStatus() === "success" && (
              <p class="mt-4 text-center text-green-500">
                Thank you for your message! We'll be in touch soon.
              </p>
            )}
            {submissionStatus() === "error" && (
              <p class="mt-4 text-center text-red-500">
                Oops! Something went wrong. Please try again later.
              </p>
            )}
          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactUs;