'use client'

import FeedCard from './FeedCard'
import { Zap, Video, Code2, Palette } from 'lucide-react'

export default function Feed() {
    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black">

            {/* CARD 1: VibeFlow Intro */}
            <FeedCard
                title="VibeFlow"
                description="VibeFlow generates full-stack web apps from prompts with n8n-style visual workflows for the backend. While frontends are easy to iterate, backends remain black boxes. VibeFlow opens up backend logic, making it visual and editable."
                bgGradient="bg-gradient-to-br from-indigo-900 via-purple-900 to-black"
                icon={<Code2 className="w-6 h-6 text-white" />}
                isIntro={true}
            />

            {/* CARD 2: Canva */}
            <FeedCard
                title="Canva"
                description="Design assets for your VibeFlow apps in seconds. Create stunning visuals, logos, and marketing materials without leaving your workflow."
                discount="50% OFF"
                bgGradient="bg-gradient-to-br from-blue-400 via-teal-500 to-emerald-600"
                icon={<Palette className="w-6 h-6 text-white" />}
            />

            {/* CARD 3: n8n */}
            <FeedCard
                title="n8n"
                description="Power your VibeFlow backend with advanced workflow automation. Connect to 200+ apps and automate complex logic visually."
                discount="50% OFF"
                bgGradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"
                icon={<Zap className="w-6 h-6 text-white" />}
            />

            {/* CARD 4: CapCut */}
            <FeedCard
                title="CapCut"
                description="Edit promo videos for your VibeFlow apps like a pro. Add effects, captions, and music to showcase your creation to the world."
                discount="50% OFF"
                bgGradient="bg-gradient-to-br from-gray-900 via-gray-800 to-black"
                icon={<Video className="w-6 h-6 text-white" />}
            />

        </div>
    )
}
