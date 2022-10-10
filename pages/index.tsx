import type { NextPage } from "next";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../src/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
  }
}
const Home: NextPage<any> = ({}) => {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const applicationVerifier = useRef<any>(null);
  const recaptchaWrapperRef = useRef<any>(null);
  const buttonText = step === 0 ? "認証番号送信" : "ログインする";
  useEffect(() => {
    setupRecaptcha();
  }, []);

  const setupRecaptcha = () => {
    if (applicationVerifier.current && recaptchaWrapperRef.current) {
      applicationVerifier.current.clear();
      recaptchaWrapperRef.current.innerHTML = `<div id="recaptcha-container"></div>`;
    }

    applicationVerifier.current = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
      },
      auth
    );
  };

  const signup = () => {
    signInWithPhoneNumber(auth, "+818083645815", applicationVerifier.current)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        setStep(1);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const checkCode = () => {
    confirmationResult
      .confirm(code)
      .then((result: any) => {
        const user = result.user;
        console.log(user);
      })
      .catch((error: any) => {
        console.log(error);
        // User couldn't sign in (bad verification code?)
        // ...
      });
  };
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>ログイン</h1>
        <p>認証番号を入力</p>
        <input
          type="text"
          onChange={(e) => setCode(e.target.value)}
          name=""
          id=""
        />
        <button onClick={step === 0 ? signup : checkCode}>{buttonText}</button>
        <div ref={(ref) => (recaptchaWrapperRef.current = ref)}>
          <div id="recaptcha-container"></div>
        </div>
        <ul>
          <li>
            <button>
              <Link href="/instructor">インストラクター</Link>
            </button>
          </li>
          <li>
            <button>
              <Link href="/lessons">レッスン</Link>
            </button>
          </li>
        </ul>
      </main>
    </div>
  );
};

export default Home;
