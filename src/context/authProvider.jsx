import { createContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log(currentUser, "currUser");
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContext.propTypes = {
  children: PropTypes.node.isRequired,
};
