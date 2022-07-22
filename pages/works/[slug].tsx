import { gql } from "@apollo/client";
import { client } from "@/pages/api/graphql";
import Layout from "@/components/layout";
import Viewer from "@/components/Viewer/Viewer";
import Metatag from "@/components/Metatag/Metatag";
import { Vault } from "@iiif/vault";
import Related from "@/components/Related/Related";
import WorkInner from "@/components/Work/Inner";
import { getValues } from "@/hooks/getValues";

export default function Manifest({ manifest }) {
  const { id, label, metadata, requiredStatement, summary, thumbnail } = manifest;
  const labelValue = getValues(label);
  const summaryValue = getValues(summary);

  return (
    <Layout>
      <Metatag label={labelValue} summary={summaryValue} thumbnail={thumbnail}/>
      <div style={{ padding: "1.31rem 0 0" }}>
        <Viewer manifestId={id} />
      </div>
      <WorkInner manifest={manifest} />
      <section
        style={{
          maxWidth: "1280px",
          margin: "auto",
          position: "relative",
          padding: "0 1.618rem",
        }}
      >
        <Related label={label} />
      </section>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  const { loading, error, data } = await client.query({
    query: gql`
      query GetManifestBySlug {
        getManifest(slug: "${slug}") { id, label }
      }
    `,
  });

  if (!data) return null;

  const { id } = data.getManifest;
  const vault = new Vault();
  const manifest = await vault
    .loadManifest(id)
    .then((data) => data)
    .catch((error) => {
      console.error(`Manifest ${id} failed to load: ${error}`);
    });

  return {
    props: { manifest },
  };
}

export async function getStaticPaths() {
  const { loading, error, data } = await client.query({
    query: gql`
      query Manifests {
        manifests {
          slug
        }
      }
    `,
  });

  const paths = data.manifests.map((item) => ({
    params: { ...item },
  }));

  return {
    paths: paths,
    fallback: false,
  };
}
