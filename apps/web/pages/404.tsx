import React from 'react';
import Head from 'next/head';
import styles from '@/styles/error.module.css';

// A static 404 error page without client-side state
function Custom404() {
  return (
    <div className={styles.container}>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.content}>
        <h1 className={styles.title}>404 - Page Not Found</h1>
        <p className={styles.message}>Sorry, the page you are looking for does not exist.</p>
        <a href="/" className={styles.link}>Return Home</a>
      </div>
    </div>
  );
}

export default Custom404;
