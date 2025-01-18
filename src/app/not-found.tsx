import Link from "next/link";

export default function Page404() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-[#d3901d]">404</h1>
      <p className="mt-4 text-2xl text-[#f3901d]">Page Not Found :(</p>
      <p className="mt-2 text-gray-500">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-[#d3901d] text-white rounded hover:bg-[#f3901d]"
      >
        Go to Home
      </Link>
    </div>
  );
}
