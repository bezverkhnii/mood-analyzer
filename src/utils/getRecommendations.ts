import axios from "axios";

export async function getRecommendations(accessToken: string, moods: string[]) {
  return axios
    .get(
      `https://api.spotify.com/v1/recommendations?limit=5&seed_genres=${moods[0]}%2C${moods[1]}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      throw new Error("Error fetching recommendations: " + err.message);
    });
}
