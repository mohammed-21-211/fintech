import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar/Navbar';
import { Hero } from '../../components/landing/Hero/Hero';
import { Features } from '../../components/landing/Features/Features';
import { PaymentSystem } from '../../components/landing/PaymentSystem/PaymentSystem';
import { Insights } from '../../components/landing/Insights/Insights';
import { ExpensesPreview } from '../../components/landing/ExpensesPreview/ExpensesPreview';
import { CTA } from '../../components/landing/CTA/CTA';
import { Newsletter } from '../../components/landing/Newsletter/Newsletter';
import { Footer } from '../../components/layout/Footer/Footer';
import { PromoModal } from '../../components/landing/Promo/PromoModal';
import { useAppStore } from '../../store';

export function LandingPage() {
  const { language } = useAppStore();
  const [promoOpen, setPromoOpen] = useState(false);
  const openPromo = () => setPromoOpen(true);

  return (
    <>
      <Navbar />
      <main>
        <Hero onLearnMore={openPromo} />
        <Features />
        <PaymentSystem />
        <Insights />
        <ExpensesPreview />
        <CTA onLearnMore={openPromo} />
      </main>
      <Newsletter />
      <Footer />
      <PromoModal open={promoOpen} onClose={() => setPromoOpen(false)} lang={language} />
    </>
  );
}
