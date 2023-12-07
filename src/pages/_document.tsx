import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          async
          src="https://umami.lebron.cloud/script.js"
          data-website-id="b6284fc3-05fa-48f9-9847-4a8f5f2ad40c"
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
