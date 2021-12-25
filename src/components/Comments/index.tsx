import { useEffect } from 'react';

export default function Comments(): JSX.Element {
  useEffect(() => {
    const scriptParentNode = document.getElementById('comments');
    if (!scriptParentNode) return null;

    const scriptElement = document.createElement('script');

    scriptElement.src = 'https://utteranc.es/client.js';
    scriptElement.async = true;
    scriptElement.crossOrigin = 'anonymous';
    scriptElement.setAttribute(
      'repo',
      'betolarbac/ignite-reactjs-spacetraveling'
    );
    scriptElement.setAttribute('issue-term', 'pathname');
    scriptElement.setAttribute('label', 'blog-comment');
    scriptElement.setAttribute('theme', 'photon-dark');

    scriptParentNode.appendChild(scriptElement);

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    };
  }, []);
  return <section id="comments" />;
}
