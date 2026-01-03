import { Flame } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-300 p-8 pt-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-full ring-1 ring-white/10 mb-4">
            <Flame className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-lg text-slate-400">StreakDSA by Shantanu Kudva</p>
        </div>

        <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. Introduction
            </h2>
            <p>
              Welcome to StreakDSA. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              as to how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. Data We Collect
            </h2>
            <p>
              We may collect, use, store and transfer different kinds of
              personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Identity Data:</strong> includes first name, last name,
                username or similar identifier.
              </li>
              <li>
                <strong>Contact Data:</strong> includes email address and
                telephone numbers (WhatsApp/SMS).
              </li>
              <li>
                <strong>Usage Data:</strong> includes information about how you
                use our website, products and services (specifically your pledge
                progress and streaks).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. How We Use Your Data
            </h2>
            <p>
              We will only use your personal data when the law allows us to.
              Most commonly, we will use your personal data in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Where we need to perform the contract we are about to enter into
                or have entered into with you (providing the StreakDSA service).
              </li>
              <li>
                To send you notifications and reminders regarding your pledge
                (via Email, SMS, or WhatsApp as configured by you).
              </li>
              <li>
                Where it is necessary for our legitimate interests (or those of
                a third party) and your interests and fundamental rights do not
                override those interests.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Data Sharing
            </h2>
            <p>
              We do not sell your personal data to third parties. We may share
              your data with third-party service providers who help us operate
              our business (e.g., email or SMS delivery services), subject to
              confidentiality agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy
              practices, please contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
