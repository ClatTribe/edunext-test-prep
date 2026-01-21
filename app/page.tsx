import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl rounded-3xl bg-white px-16 py-32 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-zinc-900">
        
        {/* Logo */}
        <Image
          className="mb-12 transition-transform duration-300 hover:scale-105 dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          
          {/* Heading */}
          <h1 className="max-w-md text-3xl font-semibold leading-snug tracking-tight text-black dark:text-zinc-100">
            This is the platform for{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              EduNext test prep
            </span>
          </h1>

          {/* Strong Name Highlight */}
          <div className="group relative inline-flex">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 blur-lg opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 shadow-xl transition-all duration-300 group-hover:scale-105">
              <p className="text-lg font-medium text-white">
                Made by
              </p>
              <p className="text-3xl font-extrabold tracking-wide text-yellow-300 sm:text-4xl">
                Saurabh Sharma 💪🏻😎🗿☠️
              </p>
            </div>
          </div>

        </div> 
      </main>
    </div>
  );
}
