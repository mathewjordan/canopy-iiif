import React, { useState } from "react";
import { gql } from "@apollo/client";
import { client } from "@/pages/api/graphql";
import Layout from "@/components/layout";
import { InView } from "react-intersection-observer";
import { map as lodashMap, groupBy as lodashGroupBy } from "lodash";
import Grid from "@/components/Grid/Grid";
import Metatag from "@/components/Metatag/Metatag";
import { dev } from "@/canopy.config";

const RESULT_LIMIT = 20;

export default function Index({ manifests, metadata }) {
  /**
   * @todo make section a component with an isFluid variant and default at max-width 1280
   */

  const [limit, setLimit] = useState(RESULT_LIMIT);
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState(manifests);

  const handleLoadMore = async () => {
    const newOffset = limit + offset;
    const data = fetchData(newOffset);

    if (data && results.length > 0)
      data.then((response) => {
        setResults(results.concat(response.manifests));
        setOffset(newOffset);
      });
  };

  /**
   * @param offset
   * @returns
   */
  const fetchData = async (offset) => {
    const { loading, error, data } = await client.query({
      query: gql`
        query Manifests {
          manifests(limit: ${RESULT_LIMIT}, offset: ${offset}) {
            id
            label
            slug
            metadata
            collectionId
          }
        }
      `,
    });
    if (data) return data;
  };

  return (
    <Layout>
      <Metatag label='Search Works' summary={`Browse works from ${dev.title}`} thumbnail={dev.hero}/>
      <section
        style={{
          maxWidth: "1280px",
          margin: "1rem auto 0",
          position: "relative",
        }}
      >
        {/* <Filter /> */}
        <Grid>
          {results &&
            results.map((result, i) => {
              return <Grid.Item data={result} key={result.id} />;
            })}
        </Grid>
        <InView
          as="div"
          onChange={(inView, entry) => handleLoadMore()}
          style={{
            width: "100%",
            height: "50vh",
            position: "absolute",
            bottom: "0",
            left: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            zIndex: "0",
          }}
        >
          <Grid.LoadMore handleLoadMore={handleLoadMore} />
        </InView>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const { loading, error, data } = await client.query({
    query: gql`
      query Manifests {
        manifests(limit: ${RESULT_LIMIT}, offset: 0) {
          id
          label
          slug
          metadata
          collectionId
        }
        Subject: metadata(label: "Subject") {
          manifestId
          label
          value
        }
        Date: metadata(label: "Date") {
          manifestId
          label
          value
        }
      }
    `,
  });

  const { manifests } = data;

  if (!data) return null;

  const METADATA_LABELS = process.env.metadata as any as string[];

  const metadata = METADATA_LABELS.map((string) => {
    const values = data[string];
    return {
      label: string,
      data: lodashMap(lodashGroupBy(values, "value"), (values, value) => ({
        value,
        values,
      })),
    };
  });

  return {
    props: { manifests, metadata },
  };
}
