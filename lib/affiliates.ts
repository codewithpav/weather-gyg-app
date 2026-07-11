// Affiliate deep links for bookable experiences. GetYourGuide carries the
// partner id; Klook and Viator are plain search links.
export interface ProviderLinks {
  getYourGuide: string;
  klook: string;
  viator: string;
}

export function buildProviderLinks(query: string, partnerId: string): ProviderLinks {
  const encoded = encodeURIComponent(query);
  return {
    getYourGuide: `https://www.getyourguide.com/s/?q=${encoded}&partner_id=${encodeURIComponent(
      partnerId
    )}`,
    klook: `https://www.klook.com/en-GB/search/result/?query=${encoded}`,
    viator: `https://www.viator.com/searchResults/all?text=${encoded}`,
  };
}
