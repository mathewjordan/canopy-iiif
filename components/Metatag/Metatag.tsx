import React, {useEffect, useState} from "react";
import { NextSeo } from 'next-seo';
import { useRouter } from "next/router";

const Metatag = ({label, summary, thumbnail}) => {
  const [baseUrl, setBaseUrl] = useState("");
  const router = useRouter();
  useEffect(() => {
    const { host, protocol } = window.location;
    const root = `${protocol}//${host}`;
    setBaseUrl(root);
  }, []);
  const canonicalUrl = ( baseUrl + (router.asPath === "/" ? "": router.asPath)).split("?")[0];

  return (
    <NextSeo
      title={label}
      description={summary}
      openGraph={
        {
          title: label,
          description: summary,
          url: canonicalUrl,
          images: [
            {
              url: thumbnail[0].id,
              alt: `${label}`
            }
          ]
        }
      }
    />
  );
};
export default Metatag;
