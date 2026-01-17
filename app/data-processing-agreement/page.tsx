'use client'

import Navigation from '@/components/Navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DataProcessingAgreement() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navigation />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <h1 className="text-4xl sm:text-5xl font-bold mb-8">Data Processing Agreement</h1>
                <p className="text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-12 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Preamble</h2>
                        <p>
                            This Data Processing Agreement ("DPA") forms part of the Master Services Agreement or Terms of Service ("Agreement")
                            between Aporto ("Processor") and the Customer ("Controller"). This DPA reflects the parties' agreement with regard
                            to the processing of Personal Data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Definitions</h2>
                        <p>
                            "Personal Data" means any information relating to an identified or identifiable natural person.
                            "Processing" means any operation or set of operations which is performed on Personal Data, such as collection,
                            recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure
                            by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Processing of Personal Data</h2>
                        <p className="mb-4">
                            The Processor shall process Personal Data only on documented instructions from the Controller, unless required to do so by law.
                            The subject matter, duration, nature, and purpose of the processing are described in the Agreement and this DPA.
                        </p>
                        <p>
                            The Controller warrants that it has all necessary rights to provide the Personal Data to Processor for the Processing to be
                            performed in relation to the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Confidentiality</h2>
                        <p>
                            The Processor shall ensure that persons authorized to process the Personal Data have committed themselves to confidentiality
                            or are under an appropriate statutory obligation of confidentiality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Security Measures</h2>
                        <p>
                            The Processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate
                            to the risk, including inter alia as appropriate:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>The pseudonymization and encryption of Personal Data.</li>
                            <li>The ability to ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems and services.</li>
                            <li>The ability to restore the availability and access to Personal Data in a timely manner in the event of a physical or technical incident.</li>
                            <li>A process for regularly testing, assessing, and evaluating the effectiveness of technical and organizational measures for ensuring the security of the processing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Sub-processors</h2>
                        <p>
                            The Controller authorizes the Processor to engage sub-processors to assist in providing the Services. The Processor shall
                            inform the Controller of any intended changes concerning the addition or replacement of other sub-processors. The Processor
                            shall remain fully liable to the Controller for the performance of the sub-processor's obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Data Subject Rights</h2>
                        <p>
                            Taking into account the nature of the processing, the Processor shall assist the Controller by appropriate technical and
                            organizational measures, insofar as this is possible, for the fulfillment of the Controller's obligation to respond to
                            requests for exercising the data subject's rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Deletion or Return of Data</h2>
                        <p>
                            At the choice of the Controller, the Processor shall delete or return all the Personal Data to the Controller after the
                            end of the provision of services relating to processing, and delete existing copies unless law requires storage of the Personal Data.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
