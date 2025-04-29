import { db } from "../services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

export const useFirestore = () => {
  const toast = useToast();

  const addDocument = async (collectionName, data) => {
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  };

  const addToWatchlist = async (userId, dataId, data) => {
    try {
      if (await checkIfInWatchlist(userId, dataId)) {
        toast({
          title: "Error!",
          description: "This item is already in your watch later list.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return false;
      }

      await setDoc(doc(db, "users", userId, "watchlist", dataId), data);
      toast({
        title: "Success!",
        description: "Added to watch later",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.log(error, "Error adding document");
      toast({
        title: "Error!",
        description: "An error occurred.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const addToWatchedFilms = async (userId, dataId, data) => {
    try {
      if (await checkIfInWatchedFilms(userId, dataId)) {
        toast({
          title: "Error!",
          description: "This item is already in your watched list.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return false;
      }

      await setDoc(doc(db, "users", userId, "watchedfilms", dataId), data);
      toast({
        title: "Success!",
        description: "Added to watched list",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.log(error, "Error adding document");
      toast({
        title: "Error!",
        description: "An error occurred.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const checkIfInWatchlist = async (userId, dataId) => {
    const docRef = doc(
      db,
      "users",
      userId?.toString(),
      "watchlist",
      dataId?.toString()
    );

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    } else {
      return false;
    }
  };

  const checkIfInWatchedFilms = async (userId, dataId) => {
    const docRef = doc(
      db,
      "users",
      userId?.toString(),
      "watchedfilms",
      dataId?.toString()
    );

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    } else {
      return false;
    }
  };

  const removeFromWatchlist = async (userId, dataId) => {
    try {
      await deleteDoc(
        doc(db, "users", userId?.toString(), "watchlist", dataId?.toString())
      );
      toast({
        title: "Success!",
        description: "Removed from watch later list.",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.log(error, "Error while deleting doc");
      toast({
        title: "Error!",
        description: "An error occurred.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const removeFromWatchedFilms = async (userId, dataId) => {
    try {
      await deleteDoc(
        doc(db, "users", userId?.toString(), "watchedfilms", dataId?.toString())
      );
      toast({
        title: "Success!",
        description: "Removed from watched list",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.log(error, "Error while deleting doc");
      toast({
        title: "Error!",
        description: "An error occurred.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const getWatchlist = useCallback(async (userId) => {
    const querySnapshot = await getDocs(
      collection(db, "users", userId, "watchlist")
    );
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    return data;
  }, []);

  const getWatchedFilms = useCallback(async (userId) => {
    const querySnapshot = await getDocs(
      collection(db, "users", userId, "watchedfilms")
    );
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    return data;
  }, []);

  const deleteWatchedFilms = async (userId) => {
    console.log("func claaded");
    try {
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "watchedfilms")
      );

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      toast({
        title: "Success!",
        description: "All watched films deleted successfully.",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting watched films:", error);
      toast({
        title: "Error!",
        description: "An error occurred while deleting watched films.",
        status: "error",
        isClosable: true,
      });
    }
  };

  return {
    addDocument,
    addToWatchlist,
    addToWatchedFilms,
    checkIfInWatchlist,
    checkIfInWatchedFilms,
    removeFromWatchlist,
    removeFromWatchedFilms,
    getWatchlist,
    getWatchedFilms,
    deleteWatchedFilms,
  };
};
