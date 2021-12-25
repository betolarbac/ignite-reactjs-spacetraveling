import { Document } from '@prismicio/client/types/documents';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPrismicClient } from '../../services/prismic';

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { token: ref, documentId } = req.query;
  const prismicClient = getPrismicClient(req);

  const redirectUrl = await prismicClient
    .getPreviewResolver(ref as string, documentId as string)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  res.setPreviewData({ ref });

  res.write(
    `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
          <script>window.location.href = '${redirectUrl}'</script>
        </head>
      </html>
    `
  );
  res.end();
};
