import Link from "next/link";
import { SERVICE_CATEGORY_GROUPS } from "@/lib/services";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to Olentangy Meadows
          </h1>
          <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Connect with your neighbors who offer summer services — from lawn mowing to window cleaning. Book trusted people right in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#services" className="bg-white text-green-700 font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition">
              Browse Services
            </a>
            <Link href="/become-seller" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-green-700 transition">
              Create Sales Account
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid — grouped by category */}
      <section id="services" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Summer Services
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Tap any service to see your neighbors who offer it
        </p>

        <div className="space-y-12">
          {SERVICE_CATEGORY_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{group.icon}</span>
                <h3 className="text-lg font-bold text-gray-700">{group.group}</h3>
                <div className="flex-1 h-px bg-gray-100 ml-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {group.services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center gap-2"
                  >
                    <span className="text-3xl">{service.icon}</span>
                    <span className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm leading-tight">
                      {service.label}
                    </span>
                    <span className="text-xs text-gray-400 line-clamp-2">
                      {service.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-green-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "🔍", title: "Browse", desc: "Pick a service and see all your neighbors who offer it, along with their prices and availability." },
              { step: "2", icon: "💬", title: "Message", desc: "Chat directly with the service provider. Send photos if needed so they can give you an accurate price." },
              { step: "3", icon: "✅", title: "Book & Pay", desc: "Pay securely through the app with a card, or choose to pay in person — whatever works best for you and your neighbor." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for sellers */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Want to offer a service?
          </h2>
          <p className="text-gray-500 mb-6">
            Create a sales account to list your services and start earning this summer. All sellers are reviewed and approved by the Olentangy Meadows admin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/become-seller"
              className="inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-700 transition text-lg"
            >
              Create Sales Account
            </Link>
            <Link
              href="/suggest-job"
              className="inline-block border-2 border-green-600 text-green-700 font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition text-lg"
            >
              Suggest a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
