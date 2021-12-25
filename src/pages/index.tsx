import { FC, useState } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { Document } from '@prismicio/client/types/documents';

import { parseDate } from '../utils/parse-date';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Head from '../components/Head';
import ExitPreview from '../components/ExitPreview';

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
  preview: boolean;
}

function parsePrismicPost(post: Document): Post {
  return {
    uid: post.uid,
    data: {
      title: post.data.title,
      author: post.data.author,
      subtitle: post.data.subtitle,
    },
    first_publication_date: post.first_publication_date,
  };
}

export default function Home({
  postsPagination: { next_page: initialNextPage, results },
  preview,
}: HomeProps): JSX.Element {
  const [{ results: posts, next_page: nextPage }, setPosts] = useState({
    results: results.map(post => ({
      ...post,
      first_publication_date: parseDate(post.first_publication_date),
    })),
    next_page: initialNextPage,
  });
  const [isFetchingMorePosts, setIsFetchingMorePosts] = useState(false);

  const loadPostCard: FC<Post> = ({
    data: post,
    first_publication_date,
    uid,
  }) => (
    <Link href={`/post/${uid}`} key={uid}>
      <a className={styles.postCard} key={uid}>
        <h2>{post.title}</h2>
        <p>{post.subtitle}</p>
        <div className={commonStyles.postDetails}>
          <span>
            <FiCalendar />
            {first_publication_date}
          </span>
          <span>
            <FiUser />
            {post.author}
          </span>
        </div>
      </a>
    </Link>
  );

  async function handleFetchPosts(): Promise<void> {
    setIsFetchingMorePosts(true);

    try {
      const postsResponse = await fetch(nextPage);
      const fetchedPosts = (await postsResponse.json()) as ApiSearchResponse;

      const parsedPosts = fetchedPosts.results.map<Post>(post => ({
        ...parsePrismicPost(post),
        first_publication_date: parseDate(post.first_publication_date),
      }));

      setPosts({
        results: [...posts, ...parsedPosts],
        next_page: fetchedPosts.next_page,
      });
    } finally {
      setIsFetchingMorePosts(false);
    }
  }

  return (
    <>
      <Head title="Início" />
      <main className={commonStyles.mainContainer}>
        <div>{posts.map(loadPostCard)}</div>

        {nextPage && !isFetchingMorePosts && (
          <button
            type="button"
            className={styles.loadMorePosts}
            onClick={handleFetchPosts}
          >
            Carregar mais posts
          </button>
        )}

        {isFetchingMorePosts && (
          <strong className={styles.loadMorePosts}>Carregando...</strong>
        )}
      </main>

      {preview && <ExitPreview />}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 10,
      ref: previewData?.ref ?? null,
    }
  );

  const parsedPosts = postsResponse.results.map<Post>(parsePrismicPost);

  return {
    props: {
      postsPagination: {
        results: parsedPosts,
        next_page: postsResponse.next_page,
      },
      preview,
    },
  };
};
