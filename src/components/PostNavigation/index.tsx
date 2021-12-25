import Link from 'next/link';
import Prismic from '@prismicio/client';

import styles from './post-navigation.module.scss';
import { getPrismicClient } from '../../services/prismic';

interface OtherPost {
  uid: string;
  data: {
    title: string;
  };
}

interface PostNavigationProps {
  next?: OtherPost;
  previous?: OtherPost;
}

function renderOtherPost(
  post?: OtherPost,
  label = '',
  textAlign: 'start' | 'end' = 'start'
): JSX.Element {
  if (!post) {
    return <div />;
  }

  return (
    <Link href={`/post/${post.uid}`}>
      <a
        style={{
          textAlign,
        }}
      >
        <span>{post.data.title}</span>
        <strong>{label}</strong>
      </a>
    </Link>
  );
}

export async function fetchOtherPost(
  targetPostId: string,
  findOrdering = ''
): Promise<OtherPost | null> {
  const prismic = getPrismicClient();

  const otherPost = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      orderings: `[document.first_publication_date ${findOrdering}]`,
      pageSize: 1,
      after: targetPostId,
      fetch: ['posts.title'],
    })
  ).results[0];

  if (!otherPost) {
    return null;
  }

  const parsedOtherPost = {
    uid: otherPost.uid,
    data: otherPost.data,
  };

  return parsedOtherPost;
}

export default function PostNavigation({
  next,
  previous,
}: PostNavigationProps): JSX.Element {
  return (
    <section className={styles.postNavigationContainer}>
      {renderOtherPost(previous, 'Post anterior')}
      {renderOtherPost(next, 'Próximo post', 'end')}
    </section>
  );
}
