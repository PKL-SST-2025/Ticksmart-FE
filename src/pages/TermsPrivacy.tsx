// src/pages/TermsPrivacy.tsx
import { Component } from "solid-js";
import MainLayout from "../layouts/MainLayout"; // Assuming you have this layout

const TermsPrivacy: Component = () => {
  const currentYear = new Date().getFullYear();

  return (
    <MainLayout>
      <section class="bg-slate-950 text-gray-200 py-20 md:py-28 px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-center text-4xl md:text-5xl font-extrabold mb-12 text-white">
            Terms & Privacy Policy
          </h1>

          <p class="text-sm text-gray-400 text-center mb-16">
            Last Updated: <time datetime="2023-10-27">October 27, {currentYear}</time>
          </p>

          {/* Terms of Service Section */}
          <div class="mb-16">
            <h2 class="text-3xl font-bold mb-6 text-blue-400">1. Terms of Service</h2>
            <p class="mb-4">
              Welcome to YourApp! These Terms of Service ("Terms") govern your access to and use of YourApp's website, products, and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Services.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">1.1. User Accounts</h3>
            <p class="mb-4">
              You may need to register an account to access some features of our Services. You are responsible for maintaining the confidentiality of your account login information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">1.2. Acceptable Use</h3>
            <p class="mb-4">
              You agree not to use the Services for any unlawful purpose or in any way that might harm, disrupt, or impair the functionality of the Services. This includes, but is not limited to, transmitting harmful code, engaging in unauthorized data collection, or interfering with other users' experience.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">1.3. Intellectual Property</h3>
            <p class="mb-4">
              All content and materials available on YourApp, including text, graphics, logos, icons, and software, are the property of YourApp, Inc. or its licensors and are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without explicit permission.
            </p>
            <p>
              Your content, however, remains yours. By using our Services, you grant YourApp a license to host, copy, and display your content solely for the purpose of operating and improving our Services.
            </p>
          </div>

          {/* Privacy Policy Section */}
          <div>
            <h2 class="text-3xl font-bold mb-6 text-purple-400">2. Privacy Policy</h2>
            <p class="mb-4">
              Your privacy is important to us. This Privacy Policy explains how YourApp, Inc. ("YourApp," "we," "us," or "our") collects, uses, and discloses information about you when you use our Services.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">2.1. Information We Collect</h3>
            <ul class="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Personal Information:</strong> When you register for an account, we collect information such as your name, email address, and payment information.
              </li>
              <li>
                <strong>Usage Data:</strong> We automatically collect information on how the Service is accessed and used. This may include IP addresses, browser types, pages visited, and time spent on pages.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information.
              </li>
            </ul>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">2.2. How We Use Your Information</h3>
            <p class="mb-4">
              We use the collected data for various purposes:
            </p>
            <ul class="list-disc list-inside space-y-2 mb-4">
              <li>To provide and maintain our Service.</li>
              <li>To notify you about changes to our Service.</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
              <li>To provide customer support.</li>
              <li>To monitor the usage of our Service.</li>
              <li>To detect, prevent, and address technical issues.</li>
            </ul>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">2.3. Data Security</h3>
            <p class="mb-4">
              The security of your data is paramount to us. We implement industry-standard measures designed to protect your Personal Data from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">2.4. Your Data Protection Rights</h3>
            <p class="mb-4">
              Depending on your location, you may have the right to access, update, or delete the personal information we hold about you. You can typically do this within your account settings, or by contacting us directly.
            </p>

            <h3 class="text-2xl font-semibold mb-4 text-white mt-8">2.5. Changes to This Privacy Policy</h3>
            <p class="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>

          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default TermsPrivacy;