import axios from "axios";

export async function getTopArtists(accessToken: string) {
  const params = {
    time_range: "short_term",
    limit: 10,
  };

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  return axios
    .get("https://api.spotify.com/v1/me/top/artists", {
      headers,
      params,
    })
    .then((res) => {
      const topTracks = res.data.items;
      return topTracks; // Return the data
    })
    .catch((err) => {
      throw new Error("Error fetching top tracks: " + err.message);
    });
}
