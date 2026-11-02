import HeroCover from '@/components/home/HeroCover';
import Manifesto from '@/components/home/Manifesto';
import BestSellersRail from '@/components/home/BestSellersRail';
import ProcessStepScroll from '@/components/home/ProcessStepScroll';
import PrettyLittleCollection from '@/components/home/PrettyLittleCollection';
import GiftingTeaser from '@/components/home/GiftingTeaser';
import MakersRoute from '@/components/home/MakersRoute';
import SocialAndReviews from '@/components/home/SocialAndReviews';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero: Pinned, Headline line-by-line reveal, 3 stacked pieces drifting with parallax */}
      <HeroCover />

      {/* 2. Manifesto: Large serif sentence filling in word-by-word on scroll */}
      <Manifesto />

      {/* 3. Best Sellers: Horizontal scroll rail, card snap, hover second-image swap, quick add */}
      <BestSellersRail />

      {/* 4. "From one bead to your hands": Pinned 4-step process scene with morphing image & 01-04 counter */}
      <ProcessStepScroll />

      {/* 5. Pretty Little Collection: Asymmetric staggered grid with image mask reveals */}
      <PrettyLittleCollection />

      {/* 6. Gifting Teaser: Split section with sticky heading & stacking cards */}
      <GiftingTeaser />

      {/* 7. Makers: Bihar to Mumbai route line draw, team portraits, animated counters */}
      <MakersRoute />

      {/* 8. Glimpse Strip & Reviews Carousel */}
      <SocialAndReviews />
    </>
  );
}
