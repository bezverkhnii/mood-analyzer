export async function getRecommendations(accessToken: string) {

  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?seed_genres=${}%2${}`,
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const data = await response.json();
  return data;
}
