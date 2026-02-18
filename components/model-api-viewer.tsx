'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface ModelAPIViewerProps {
    modelName: string;
}

export function ModelAPIViewer({ modelName }: ModelAPIViewerProps) {
    const [activeTab, setActiveTab] = useState<'python' | 'js' | 'curl'>('python');
    const [copied, setCopied] = useState(false);

    const getCode = (tab: 'python' | 'js' | 'curl') => {
        switch (tab) {
            case 'python':
                return `from openai import OpenAI

client = OpenAI(
  base_url="https://api.aporto.tech/v1",
  api_key="<YOUR_API_KEY>"
)

completion = client.chat.completions.create(
  model="${modelName}",
  messages=[
    {"role": "user", "content": "What is the meaning of life?"}
  ]
)

print(completion.choices[0].message.content)`;
            case 'js':
                return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.aporto.tech/v1",
  apiKey: "<YOUR_API_KEY>",
});

const completion = await openai.chat.completions.create({
  model: "${modelName}",
  messages: [
    { role: "user", content: "What is the meaning of life?" }
  ],
});

console.log(completion.choices[0].message.content);`;
            case 'curl':
                return `curl https://api.aporto.tech/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
    "model": "${modelName}",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  }'`;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCode(activeTab));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 my-8">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
                <div className="flex space-x-2">
                    {(['python', 'js', 'curl'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                }`}
                        >
                            {tab === 'python' ? 'Python' : tab === 'js' ? 'JavaScript' : 'cURL'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                    title="Copy code"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                    <code>{getCode(activeTab)}</code>
                </pre>
            </div>
        </div>
    );
}
