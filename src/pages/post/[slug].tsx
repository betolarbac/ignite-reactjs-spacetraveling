/* eslint-disable react/no-danger */
import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Image from 'next/image';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from '../../components/Head';
import Comments from '../../components/Comments';
import { getPrismicClient } from '../../services/prismic';
import { parseDate } from '../../utils/parse-date';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import ExitPreview from '../../components/ExitPreview';
import PostNavigation, {
  fetchOtherPost,
} from '../../components/PostNavigation';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
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
  preview: boolean;
  navigation: Parameters<typeof PostNavigation>[0];
}

type PageRoute = {
  slug: string;
};

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): JSX.Element {
  const { isFallback } = useRouter();
  const readTime = useMemo(() => {
    if (isFallback) {
      return 0;
    }

    const readWordsPerMinute = 200;

    const wordsCount = post.data.content.reduce(
      (acc, currentContent) =>
        `${currentContent.heading} ${RichText.asText(
          currentContent.body
        )}`.split(/\s+/g).length + acc,
      0
    );

    return Math.ceil(wordsCount / readWordsPerMinute);
  }, [post, isFallback]);

  if (isFallback) {
    return <strong className={styles.loadingText}>Carregando...</strong>;
  }

  const { data } = post;

  return (
    <>
      <Head title={data.title} />
      <div className={styles.postImage}>
        <Image layout="fill" src={data.banner.url} objectFit="cover" />
      </div>
      <article className={commonStyles.mainContainer}>
        <h1 className={styles.postTitle}>{data.title}</h1>
        <div className={commonStyles.postDetails}>
          <span>
            <FiCalendar />
            {parseDate(post.first_publication_date)}
          </span>
          <span>
            <FiUser />
            {data.author}
          </span>
          <span>
            <FiClock /> {readTime} min
          </span>
        </div>

        {post.last_publication_date && (
          <i className={styles.lastPublication}>
            * editado em {parseDate(post.last_publication_date, true)}
          </i>
        )}

        {data.content.map(postContent => (
          <section className={styles.postSection} key={postContent.heading}>
            <h2>{postContent.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(postContent.body),
              }}
            />
          </section>
        ))}

        <hr />

        <PostNavigation {...navigation} />

        {!preview && <Comments />}
      </article>

      {preview && <ExitPreview />}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 10,
      fetch: ['posts.title'],
    }
  );

  const mappedPosts = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    fallback: true,
    paths: mappedPosts,
  };
};

export const getStaticProps: GetStaticProps<PostProps, PageRoute> = async ({
  params,
  preview = false,
  previewData,
}) => {
  try {
    const prismic = getPrismicClient();
    const {
      data: post,
      first_publication_date,
      last_publication_date,
      uid,
      id,
    } = await prismic.getByUID('posts', String(params.slug), {
      fetch: ['posts.title', 'posts.banner', 'posts.author', 'posts.content'],
      ref: previewData?.ref ?? null,
    });

    const parsedPost: Post = {
      data: post,
      uid,
      first_publication_date,
      last_publication_date:
        first_publication_date !== last_publication_date
          ? last_publication_date
          : null,
    };

    const navigation = {
      next: await fetchOtherPost(id),
      previous: await fetchOtherPost(id, 'desc'),
    };

    return {
      props: {
        post: parsedPost,
        preview,
        navigation,
      },
      revalidate: 60 * 60 * 12, // 12 hours
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
