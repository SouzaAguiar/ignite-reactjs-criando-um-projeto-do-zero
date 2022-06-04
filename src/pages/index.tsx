import { Console } from 'console';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { Info } from '../components/Info';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import { formatdata } from '../util';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function reducePosts(posts: Post[]): Post[] {
  return posts.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,

    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [next_page, setNextPage] = useState(postsPagination.next_page);

  const handlerNextPage = async (): Promise<void> => {
    const response = await fetch(next_page).then(res => res.json());
    const nextPage = response.next_page;
    const newPosts = reducePosts(response.results);
    setPosts([...posts, ...newPosts]);
    setNextPage(nextPage);
  };
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.conteiner}>
        <Header />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <Info
                  author={post.data.author}
                  first_publication_date={formatdata(
                    post.first_publication_date
                  )}
                />
              </a>
            </Link>
          ))}
          {next_page && (
            <button type="button" onClick={handlerNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });
  const posts = reducePosts(postsResponse.results);
  const { next_page } = postsResponse;
  return {
    props: {
      postsPagination: {
        next_page: next_page || null,
        results: posts,
      },
    },
  };
};
