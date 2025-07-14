import { NextPage } from 'next';
import Head from 'next/head';

// A simple server error page without any client-side dependencies
const ServerError: NextPage = () => {
  return (
    <>
      <Head>
        <title>500 - Server Error</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#242424] text-white">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
          <p className="mb-6">Sorry, something went wrong on our server.</p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </>
  );
};

export default ServerError;
