"use client";

import { gql, useQuery } from "@apollo/client";
import { Address } from "~~/components/scaffold-eth";

const TokenURITable = () => {
  const TOKEN_URIS_GRAPHQL = `
 {
  tokens(first: 5) {
    id
    tokenURI
    owner {
      id
    }
    createdAt
  }
  owners(first: 5) {
    id
    address
    tokens {
      id
    }
  }
}
  `;

  const TOKEN_URIS_GQL = gql(TOKEN_URIS_GRAPHQL);
  const { data: tokensData, error } = useQuery(TOKEN_URIS_GQL, { fetchPolicy: "network-only" });

  if (error) {
    console.log("error in subgraph")
    return <></>;
  }
  const decodeBase64 = (base64String: string) => {
    try {
      const binaryString = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(binaryString);
    } catch (error) {
      console.error("Error decoding base64:", error);
      return null;
    }
  };

  const decodeSVG = (tokenURI: string) => {
    try {
      const parts = tokenURI.split(",");
      if (parts.length < 2) {
        throw new Error("Invalid token URI format");
      }
      const base64Json = parts[1];
      const jsonString = decodeBase64(base64Json);
      if (!jsonString) {
        throw new Error("Error decoding base64 JSON");
      }
      const json = JSON.parse(jsonString);
      if (!json.image) {
        throw new Error("No image field in JSON");
      }
      const base64Svg = json.image.split(",")[1];
      let svgContent = decodeBase64(base64Svg);
      if (!svgContent) {
        throw new Error("Error decoding base64 SVG");
      }
      // Add width, height, and viewBox to make the SVG auto-fit the container
      svgContent = svgContent.replace(
        '<svg',
        '<svg width="100%" height="100%" viewBox="0 0 500 500"' // Ensure viewBox matches the original SVG dimensions
      );
      return svgContent;
    } catch (error) {
      console.error("Error decoding SVG:", error);
      return null;
    }
  };
  
  return (
    <div className="flex justify-center items-center mt-10">
      <div className="overflow-x-auto shadow-2xl rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Token URI Table</h2>
      <h3 className="text-lg font-bold mb-4 text-center">NFTs - smile or frown are based on benchmarking whether checkout sales are greater than lower than latest price of ETH USD</h3>
        <table className="table bg-base-100 table-zebra">
          <thead>
            <tr className="rounded-xl">
              <th className="bg-primary">ID</th>
              <th className="bg-primary">Owner</th>
              <th className="bg-primary">SVG</th>
              <th className="bg-primary">Token URI</th>
            </tr>
          </thead>
          <tbody>
            {tokensData?.tokens?.map((token: any, index: number) => {
              const svgContent = decodeSVG(token.tokenURI);
              return (
                <tr key={token.id}>
                  <th>{token.id}</th>
                  <td>
                    <Address address={token?.owner?.id} />
                  </td>
                  <td>
                  {svgContent ? (
                      <div style={{ width: '100px', height: '100px' }}> 
                        <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ width: '100%', height: '100%' }} />
                      </div> ): (
                      <p>Error decoding SVG</p>
                    )}
                  </td>
                  <td>{token.tokenURI}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenURITable;
