"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { SetStateAction, useState } from "react";
import { generateCodeChallenge } from "@/utils/generateCodeChallenge";
import { getProfile } from "@/utils/getProfile";
import { generateRandomString } from "@/utils/generateRandomString";
import { useRouter } from "next/navigation";
import { getAllGenres } from "@/utils/getAllGenres";
import { getTopArtists } from "@/utils/getTopArtists";
// import { joinGenres } from "@/utils/joinGenres";
import { moodButtons } from "@/constants/data";
import Button from "@/components/Button";
import { pickTwoMoods } from "@/utils/pickTwoMoods";
import { getRecommendations } from "@/utils/getRecommendations";

export default function Home() {
  const [mood, setMood] = useState("");
  const [genres, setGenres] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const router = useRouter();
  let profile = getUserData();
  console.log(profile);
  console.log(mood);
  console.log(topArtists);
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const redirectUri = "http://localhost:3000";

  //input handling

  const storeUserData = (userData) => {
    localStorage.setItem("user_data", JSON.stringify(userData));
  };

  function getUserData() {
    const userDataString = localStorage.getItem("user_data");
    if (userDataString) {
      return JSON.parse(userDataString);
    } else {
      return null; // No user data found
    }
  }

  const handleLogin = () => {
    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      let state = generateRandomString(16);
      let scope = "user-read-private user-top-read user-read-email";

      localStorage.setItem("code_verifier", codeVerifier);

      let args = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      });

      window.location = "https://accounts.spotify.com/authorize?" + args;
    });
  };

  const postReq = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");

    let codeVerifier = localStorage.getItem("code_verifier");
    let body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    const response = fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access_token", data.access_token);
        getProfile(data.access_token).then((profileData) => {
          storeUserData(profileData);
          router.refresh();
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const generateRecs = (token: string, moodArr: string[]) => {
    let moods = pickTwoMoods(moodArr);
    console.log(moods);
    getRecommendations(token, moods);
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        {profile ? (
          <div className={styles.profileBar}>
            <p className={styles.username}>{profile.display_name}</p>
            <div className={styles.logoContainer}>
              <Image
                className={styles.logo}
                src={profile.images[0].url}
                alt="logo"
                height={40}
                width={40}
              />
            </div>
          </div>
        ) : (
          <div className={styles.loginBtns}>
            <button onClick={() => handleLogin()}>Authorize</button>
            <button onClick={() => postReq()}>Login</button>
          </div>
        )}
      </nav>
      <h1 className={styles.headText}>
        <span className={styles.limeColor}>Spotify</span> based on your mood
      </h1>
      <p className={styles.description}>
        Give your emotions a boost with music extension.
      </p>
      <h3>What's your mood for today?</h3>
      <div className={styles.buttonsContainer}>
        {Object.keys(moodButtons).map((key) => (
          <Button
            key={key}
            text={moodButtons[key].btn}
            fn={() =>
              generateRecs(
                localStorage.getItem("access_token"),
                moodButtons[key].genres
              )
            }
          />
        ))}
      </div>
      {topArtists.length ? (
        <div className={styles.artistsContainer}>
          {topArtists.map((artist, idx) => (
            <div key={artist.id} className={styles.topArtistsContainer}>
              <div className={styles.place}>{idx + 1}.</div>
              <div className={styles.artistInfo}>
                <Image
                  src={artist.images[0].url}
                  alt="artist"
                  height={160}
                  width={160}
                />
                <p className={styles.artistName}>{artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() =>
            getTopArtists(localStorage.getItem("access_token")).then((data) => {
              setTopArtists(data);
            })
          }
        >
          Wrap your 10 Top Artists!
        </button>
      )}
    </main>
  );
}
