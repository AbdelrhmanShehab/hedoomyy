import Image from "next/image";
import feedbacks from "../../data/feedback";   
export default function Feedback() {
    return (
        <section className="relative w-full min-h-[900px] bg-white overflow-hidden flex flex-col justify-center items-center py-24">

            {/* Section Label */}
            <div className="absolute top-8 left-8 z-20">
                <h3 className="text-2xl font-light text-gray-700">Our Family</h3>
            </div>

            {/* Center Text */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                    Explore what our customers <br className="hidden md:block" />
                    have to say about us
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-medium">
                    your feedback shapes everything we do &lt;3
                </p>
            </div>

            {/* Mobile / Tablet Grid */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl px-4 mt-12">
                {feedbacks.map((item) => (
                    <Image
                        key={item.id}
                        src={item.src}
                        alt="Customer feedback"
                        width={600}
                        height={500}
                        className="w-full h-auto object-contain"
                    />
                ))}
            </div>

            {/* Desktop Floating Irregular Circle */}
            {feedbacks.map((item) => (
                <div
                    key={item.id}
                    className={`hidden lg:block absolute ${item.desktop}`}
                >
                    <Image
                        src={item.src}
                        alt="Customer feedback"
                        width={500}
                        height={400}
                        className="w-full h-auto object-contain 
                       hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ))}

        </section>
    );
}
