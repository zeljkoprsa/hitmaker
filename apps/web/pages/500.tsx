import React from 'react';
import Head from 'next/head';
import styles from '@/styles/error.module.css';

// A static 500 error page without client-side state
function Custom500() {
  return (
    <div className={styles.container}>
      <Head>
        <title>500 - Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.content}>
        <h1 className={styles.title}>500 - Server Error</h1>
        <p className={styles.message}>Sorry, something went wrong on our server.</p>
        <a href="/" className={styles.link}>Return Home</a>
      </div>
    </div>
  );
}

export default Custom500;
