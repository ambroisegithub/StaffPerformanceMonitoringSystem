
import BenefitsSection from '../components/HelloSection/BenefitsSection';
import HelloSection from '../components/HelloSection/HelloSection';
import * as React from 'react';
import HowItWorksSection from '../components/HelloSection/HowItWorksSection';
import FeaturesSection from '../components/HelloSection/FeaturesSection';
import CTASection from '../components/HelloSection/CTASection';

function Home() {

  return (
    <main>
      <HelloSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
export default Home;

