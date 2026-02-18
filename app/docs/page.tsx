import Header from '../../components/Header';
import { SiteFooter } from '../../components/site-footer';

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <Header />

            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <h1 className="text-4xl font-bold mb-4">Quickstart</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Get started with Aporto's unified API in seconds.
                </p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">1. Get your API Key</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        To use the API, you'll need an API key. Sign up or log in to your dashboard to generate one.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        <code className="text-sm font-mono text-purple-600">sk-or-v1-********************</code>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">2. Configure your client</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You can use any OpenAI-compatible client. Just change the <code>baseURL</code> and use your Aporto API key.
                    </p>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">OpenAI Python SDK</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre><code>{`import openai

client = openai.OpenAI(
  base_url="https://api.aporto.tech",
  api_key="<YOUR_API_KEY>",
)

completion = client.chat.completions.create(
  model="openai/gpt-4o",
  messages=[
    {
      "role": "user",
      "content": "What is the meaning of life?",
    },
  ],
)
print(completion.choices[0].message.content)`}</code></pre>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">OpenAI Node.js SDK</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre><code>{`import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://api.aporto.tech",
  apiKey: "<YOUR_API_KEY>",
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?",
      },
    ],
  })
  console.log(completion.choices[0].message.content)
}

main()`}</code></pre>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">3. Supported Models</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Browse our <a href="/models" className="text-blue-600 hover:underline">Models page</a> to see all supported models and their IDs.
                    </p>
                </section>

            </div>

            <SiteFooter />
        </main>
    );
}
