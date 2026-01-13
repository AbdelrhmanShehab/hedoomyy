import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import NewArrivals from "@/components/home/NewArrivals";
import hedoomyybanner from "../public/hedoomyybanner.png"
import BestSeller from "@/components/home/BestSeller";
import Feedback from "@/components/home/Feedback";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen ">

        <Image
          src={hedoomyybanner}
          className="h-[70vh] w-full object-cover"
          alt="Picture of the author"
        />
      <main className="flex-grow container">
        <Hero />
        <Categories />
        <NewArrivals />
        <BestSeller />
        <Feedback />  
      </main>
    </div>
  );
}
