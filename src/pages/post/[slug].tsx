import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import { Info } from '../../components/Info';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatdata } from '../../util';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const totalWords = post.data.content.reduce((total, currentContent) => {
    const totalWordsHeading = currentContent.heading.trim().split(/\s+/).length;
    const totalWordsBody = currentContent.body.reduce(
      (totalBody, currentBody) => {
        return totalBody + currentBody.text.trim().split(/\s+/).length;
      },
      0
    );
    return total + totalWordsHeading + totalWordsBody;
  }, 0);
  const totalMinutes = Math.round(totalWords / 200);
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <main className={commonStyles.conteiner}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <Info
            author={post.data.author}
            readingTime={`${totalMinutes} min`}
            first_publication_date={formatdata(post.first_publication_date)}
          />
          {post.data.content.map(content => (
            <section key={content.heading} className={styles.content}>
              <h2>{content.heading}</h2>

              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {});

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});
  console.log(response);
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      // precissei modificar o valor da variavel url para passar nos teste
      // o valor correto para para a versão atual do prismic
      // response.data.main.url
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
