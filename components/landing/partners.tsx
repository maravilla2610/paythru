import Image from "next/image";

export function Partners() {
  return (
    <section className="bg-black py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 bg-gradient-to-b from-gray-400 to-white bg-clip-text text-md font-bold text-transparent md:text-2xl">
            Trusted by Leading Institutions
          </h2>
          <p className="text-gray-400">
            Feel confident knowing you're partnering with a trusted OTC desk that prioritizes security, compliance, and exceptional service.
          </p>
        </div>
        {/** Logos of companies that partner with us */}
        <div className="w-full py-4">
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
                <Image src="/nonco-logo.svg" alt="Partner 1" className="h-12 object-contain" height={100} width={100}/>
                <Image src="/logo-azul.svg" alt="Partner 3" className="h-12 object-contain" height={100} width={100}/>
            </div>

        </div>
      </div>
    </section>
  );
}
