"use client";

import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

import styles from "../styles/Home.module.css";

const EditorState = dynamic(() => import("../src/components/EditorState"), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Prose</title>
          <meta name="description" content="Prose editor" />
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          ></meta>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          ></link>
          <link
            href="https://cdn.jsdelivr.net/npm/@creativebulma/bulma-badge@1.0.1/dist/bulma-badge.min.css"
            rel="stylesheet"
          ></link>
        </Head>
        <main className={styles.main}>
          <EditorState />
        </main>
      </div>
      <div id="mermaid-container"></div>
    </>
  );
};

export default Home;
