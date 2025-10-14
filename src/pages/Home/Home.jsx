import BannerSlider from "../../components/Home/Banner"
import Banner from "../../components/Home/Banner"
import HeroSection from "../../components/Home/Banner"
import CustomerReviews from "../../components/Home/CustomerReviews"

import LatestBlogsSection from "../../components/Home/LatestBlogsSection"
import MeetOurAgents from "../../components/Home/MeetOurAgents"
import NewsletterSubscription from "../../components/Home/NewsletterSubscription"

import PopularPolicies from "../../components/Home/PopularPolicies"



const Home = () => {
    return (
        <div className="max-w-[1660px] mx-auto ">
            <BannerSlider></BannerSlider>
            <PopularPolicies></PopularPolicies>
            <LatestBlogsSection></LatestBlogsSection>
            <CustomerReviews></CustomerReviews>
            <NewsletterSubscription></NewsletterSubscription>
            <MeetOurAgents></MeetOurAgents>
            {/* <Footer></Footer> */}
            {/*  */}

        </div>
    )
}

export default Home
