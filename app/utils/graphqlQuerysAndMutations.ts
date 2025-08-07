export const SHOP_INFO_QUERY = `#graphql
  query shopInfo {
    shop {
      id
      name
      primaryDomain {
        host
      }
      email
    }
  }
`;

export const PRODUCTS_QUERY_FREE = `#graphql
  query GetFirst250Products {
    products(first: 25 ) {
      edges {
        cursor
        node {
          id
          title
          description
          createdAt
          onlineStoreUrl
          variants(first: 1) {
            nodes {
              price
            }
          }
          seo {
            title
            description
          }
          featuredMedia {
            mediaContentType
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY_STARTER = `#graphql
  query GetFirst250Products {
    products( first: 100 ) {
      edges {
        cursor
        node {
          id
          title
          description
          onlineStoreUrl
          createdAt
          variants(first: 1) {
            nodes {
              price
            }
          }
          seo {
            title
            description
          }
          featuredMedia {
            mediaContentType
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY_PRO = `#graphql
  query GetFirst250Products {
    products( first: 250 ) {
      edges {
        cursor
        node {
          id
          title
          description
          onlineStoreUrl
          createdAt
          variants(first: 1) {
            nodes {
              price
            }
          }
          seo {
            title
            description
          }
          featuredMedia {
            mediaContentType
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `#graphql
  query GetCollections {
    collections(first: 50) {
      nodes {
        id
        title
        description
        handle
        image {
          url
        }
      }
    }
  }
`;

export const BLOGS_QUERY = `#graphql
  query GetBlogs {
    blogs(first: 100) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

export const PAGES_QUERY = `#graphql
  query GetPages {
    pages(first: 100) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

export const GENERATE_URL_REDIRECT_MUTATION = `#graphql
  mutation UrlRedirectCreate($urlRedirect: UrlRedirectInput!) {
    urlRedirectCreate(urlRedirect: $urlRedirect) {
      urlRedirect {
        id
        path
        target
      }
      userErrors {
        field
        message
      }
    }
  }
` 
export const GET_URL_REDIRECT_QUERY = `#graphql
  query {
  urlRedirects(first: 10, query: "path:/llms.txt") {
    nodes {
      id
      path
      target
    }
  }
}
` 
export const DELETE_URL_REDIRECT_MUTATION = `#graphql
  mutation {
  urlRedirectDelete(id: "gid://shopify/UrlRedirect/446899257567") {
    deletedUrlRedirectId
    userErrors {
      field
      message
    }
  }
}
` 