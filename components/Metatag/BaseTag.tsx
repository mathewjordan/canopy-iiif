import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import { NextSeo } from 'next-seo';
import { dev } from "@/canopy.config";

const BaseTag = () => {
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
      canonical={canonicalUrl}
      titleTemplate={`${dev.title} | %s`}
      additionalLinkTags={
        [
          {
            rel: 'icon',
            href: '/images/favicon.ico',
          }
        ]
      }
      additionalMetaTags={
        [
          {
            name: 'google-site-verification',
            content: dev.seo.metatags.googleSiteVerification,
          }
        ]
      }
      twitter={
        {
          site: dev.seo.metatags.twitter.site,
          handle: dev.seo.metatags.twitter.handle,
          cardType: 'summary_large_image'
        }
      }
    />
  );
};
export default BaseTag;