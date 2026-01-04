import { Flame } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 p-8 pt-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-full ring-1 ring-white/10 mb-4">
            <Flame className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-lg text-slate-400">StreakDSA by Shantanu Kudva</p>
        </div>

        <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using StreakDSA, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you
              do not agree with any of these terms, you are prohibited from
              using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on StreakDSA&apos;s website
              for personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. Disclaimer</h2>
            <p>
              The materials on StreakDSA&apos;s website are provided on an
              &apos;as is&apos; basis. StreakDSA makes no warranties, expressed
              or implied, and hereby disclaims and negates all other warranties
              including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Limitations
            </h2>
            <p>
              In no event shall StreakDSA or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on StreakDSA&apos;s website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws and you irrevocably submit to the
              exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
