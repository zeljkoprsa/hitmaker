import Document, { Html, Head, Main, NextScript } from 'next/document'

// This custom document avoids using any React context or hooks
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style dangerouslySetInnerHTML={{ __html: `
            body {
              background-color: #242424;
              color: white;
              margin: 0;
              padding: 0;
            }
          `}} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
