"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { SetStateAction, useState } from "react";
import { generateCodeChallenge } from "@/utils/generateCodeChallenge";
import { getProfile } from "@/utils/getProfile";
import { generateRandomString } from "@/utils/generateRandomString";
import { useRouter } from "next/navigation";
import { getAllGenres } from "@/utils/getAllGenres";

export default function Home() {
  const [mood, setMood] = useState("");
  const [genres, setGenres] = useState([]);
  const router = useRouter();
  let profile = getUserData();
  console.log(profile);
  console.log(genres);
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const redirectUri = "http://localhost:3000";

  //input handling
  const handleSubmit = (e: {
    preventDefault: () => void;
    target: { value: SetStateAction<string> };
  }) => {
    e.preventDefault();
    setMood(e.target.value);
    console.log(mood);
  };

  const handleInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setMood(e.target.value);
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

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
      let scope = "user-read-private user-read-email";

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
      <h1 className={styles.headText}>Spotify based on your mood</h1>
      <p className={styles.description}>
        Give your emotions a boost with music extension.
      </p>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="How's your mood today?"
          value={mood}
          className={styles.input}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
      </div>
      <button
        onClick={() =>
          getAllGenres(localStorage.getItem("access_token")).then((data) =>
            setGenres(data.genres)
          )
        }
      >
        get genres
      </button>
      {genres && genres.map((genre, idx) => <p key={idx}>{genre}</p>)}
    </main>
  );
}
