import HelloSection from "../components/HelloSection/HelloSection"
import HowItWorksSection from "../components/HelloSection/HowItWorksSection"
import FeaturesSection from "../components/HelloSection/FeaturesSection"
import CTASection from "../components/HelloSection/CTASection"
import React from "react"

function Home() {
  return (
    <main>
      <HelloSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  )
}

export default Home
