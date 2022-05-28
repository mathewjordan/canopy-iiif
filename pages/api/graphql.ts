import { ApolloServer, gql } from "apollo-server-micro";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getCollectionData, getAllManifests } from "@/services/iiif";
import slugify from "slugify";
import { getValues } from "@/hooks/getValues";
const axios = require("axios");

const typeDefs = gql`
  type Query {
    collections: [Collection]
    collectionItems: [CollectionItem]
    manifests(limit: Int, offset: Int, id: [String]): [Manifest]
    metadata(id: String, label: String): [Metadata]
    metadataItems(id: String, label: String, valueOfMetadata: String): [Manifest]
    allManifests: [Manifest]
    getManifest(slug: ID): Manifest
  }

  type Collection {
    id: String
    label: [String]
    items: [CollectionItem]
    collections: Int
    manifests: Int
    depth: Int
    parent: String
    slug: ID
  }

  type CollectionItem {
    id: String
    label: [String]
    type: String
    parent: String
  }

  type Manifest {
    collectionId: ID
    id: ID
    label: [String]
    metadata: [Metadata]
    slug: ID
    thumbnail: String
    summary: String
  }

  type Metadata {
    manifestId: String
    label: String
    value: String
    thumbnail: String
  }
`;

const resolvers = {
  Query: {
    collections: async (_, __, context) => {
      return getCollectionData();
    },
    collectionItems: async (_, __, context) => {
      return getCollectionData().then((tree) => {
        return Promise.all(tree).then((values) => {
          let items = [];
          values.forEach((results) => {
            results.items.forEach((element) => {
              items.push(element);
            });
          });
          return items;
        });
      });
    },
    manifests: async (_, { limit, offset, id }, context) => {
      return getCollectionData().then((tree) => {
        return Promise.all(tree).then((values) => {
          let items = [];
          values.forEach((results) => {
            if (results)
              results.items.forEach((element) => {
                items.push(element);
              });
          });
          let results = items.filter((item) => {
            item.slug = slugify(item.label[0], {
              lower: true,
              strict: true,
              trim: true,
            });
            item.collectionId = null;
            return item.type === "Manifest";
          });
          if (Array.isArray(id)) {
            results = results.filter((result) => id.includes(result.id));
          }
          if (Number.isInteger(limit) && Number.isInteger(offset))
            results = results.slice(offset, offset + limit);
          return results;
        });
      });
    },
    metadata: async (_, { id, label }, context) => {
      let filterByLabels = process.env.metadata;
      if (label) filterByLabels = [label as string];

      return getCollectionData().then((tree) => {
        return Promise.all(tree).then((values) => {
          let items = [];
          if (id) {
            items.push({ id, type: "Manifest" });
          } else {
            values.forEach((results) => {
              if (results)
                results.items.forEach((element) => {
                  items.push(element);
                });
            });
          }

          const responses = getBulkManifests(items, 10);

          return responses.then((manifests) => {
            let data = [];
            manifests
              .filter((manifest) => {
                if (manifest) return manifest;
              })
              .map((manifest) => {
                manifest.metadata.forEach((metadata) => {
                  const metadataLabel = getValues(metadata.label)[0];
                  const metadataValues = getValues(metadata.value);
                  if (filterByLabels.includes(metadataLabel)) {
                    metadataValues.forEach((value) => {
                      const result = {
                        manifestId: manifest.id,
                        label: metadataLabel,
                        value,
                        thumbnail: manifest.thumbnail[0].id,
                      };
                      data.push(result);
                    });
                  }
                });
              });
            return data;
          });
        });
      });
    },
    metadataItems: async (_, { id, label, valueOfMetadata }, context) => {
      let filterByLabels = process.env.metadata;
      if (label) filterByLabels = [label as string];

      return getCollectionData().then((tree) => {
        return Promise.all(tree).then((values) => {
          let items = [];
          if (id) {
            items.push({ id, type: "Manifest" });
          } else {
            values.forEach((results) => {
              if (results)
                results.items.forEach((element) => {
                  items.push(element);
                });
            });
          }

          const responses = getBulkManifests(items, 10);

          return responses.then((manifests) => {
            let data = [];
            manifests
              .filter((manifest) => {
                if (manifest) return manifest;
              })
              .map((manifest) => {
                manifest.metadata.forEach((metadata) => {
                  const metadataLabel = getValues(metadata.label)[0];
                  const metadataValues = getValues(metadata.value);
                  if (filterByLabels.includes(metadataLabel)) {
                    metadataValues.forEach((value) => {
                      if(value === valueOfMetadata){
                        const result = {
                          id: manifest.id,
                          label: getValues(manifest.label),
                          metadata: manifest.metadata,
                          thumbnail: manifest.thumbnail[0].id,
                          slug: manifest.id,
                          summary: getValues(manifest.summary)[0],
                          collectionId: `api/iiif/metadata/${metadataLabel}/${value}`,
                        };
                        data.push(result);
                      }
                    });
                  }
                });
              });
            return data;
          });
        });
      });
    },
    allManifests: async (_, __, context) => {
      return getAllManifests();
    },
    getManifest: async (manifests, { slug }, context) => {
      return getCollectionData().then((tree) => {
        return Promise.all(tree).then((values) => {
          let items = [];
          values.forEach((results) => {
            results.items.forEach((element) => {
              items.push(element);
            });
          });
          return items.filter((item) => {
            item.slug = slugify(item.label[0], {
              lower: true,
              strict: true,
              trim: true,
            });
            item.collectionId = null;
            return item.slug === slug;
          })[0];
        });
      });
    },
  },
};

const getBulkManifests = async (items, chunkSize) => {
  return await chunks(
    items,
    async (item) => {
      const { id, type } = item;
      if (type === "Manifest")
        return axios.get(id).then((result) => result.data);
    },
    chunkSize
  );
};

/*
 * Embedded axios based request handlers
 */
function all(items, fn) {
  const promises = items.map((item) => fn(item));
  return Promise.all(promises);
}

function series(items, fn) {
  let result = [];
  return items
    .reduce((acc, item) => {
      acc = acc.then(() => {
        return fn(item).then((res) => result.push(res));
      });
      return acc;
    }, Promise.resolve())
    .then(() => result);
}

function splitToChunks(items, chunkSize = 25) {
  const result = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }
  return result;
}

function chunks(items, fn, chunkSize = 25) {
  let result = [];
  const chunks = splitToChunks(items, chunkSize);
  return series(chunks, (chunk) => {
    return all(chunk, fn).then((res) => (result = result.concat(res)));
  }).then(() => result);
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new SchemaLink({ schema }),
  ssrMode: true,
  ssrForceFetchDelay: 100,
});

export const getGraphQL = (query) =>
  fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((json) => json.data);
