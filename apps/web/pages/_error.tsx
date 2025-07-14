import { NextPage } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode?: number;
}

// A simple error page without any client-side dependencies
const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - Error` : 'Error'}</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#242424] text-white">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">
            {statusCode ? `${statusCode} - Error` : 'An Error Occurred'}
          </h1>
          <p className="mb-6">
            {statusCode
              ? `A server-side error occurred (${statusCode}).`
              : 'An error occurred on the client.'}
          </p>
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

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
