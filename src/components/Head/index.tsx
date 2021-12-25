import NextHead from 'next/head';

interface HeadProps {
  title: string;
}

export default function Head({ title }: HeadProps): JSX.Element {
  return (
    <NextHead>
      <title>{title} | spacetraveling</title>
    </NextHead>
  );
}
