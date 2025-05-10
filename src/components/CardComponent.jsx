import {
  Box,
  Flex,
  IconButton,
  Image,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { fetchDetails, imagePath } from "../services/api";
import { CheckIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons";
import { MdOutlineWatchLater } from "react-icons/md";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../services/firestore";

const CardComponent = ({
  item,
  type,
  isEnabled = "true",
  setWatchlist = null,
}) => {
  const { user } = useAuth();
  const {
    addToWatchlist,
    addToWatchedFilms,
    removeFromWatchlist,
    moveToWatchedFilmsFromWatchlist,
  } = useFirestore();
  const toast = useToast();

  const handleAddToWatched = async (event) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Login to mark as watched",
        status: "error",
        isClosable: true,
      });
      return;
    }

    const details = await fetchDetails(type, item.id);

    const data = {
      id: details?.id,
      title: details?.title || details?.name,
      type: type,
      poster_path: details?.poster_path,
      release_date: details?.release_date || details?.first_air_date,
      vote_average: details?.vote_average,
      overview: details?.overview,
      saved_at: new Date().toISOString(),
      runtime: details?.runtime || details?.number_of_episodes,
      genres: details?.genres?.map((genre) => genre.name) || [],
    };

    const dataId = details?.id?.toString();
    await addToWatchedFilms(user?.uid, dataId, data);
  };

  const handleAddToWatchLater = async (event) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Login to add to watch later",
        status: "error",
        isClosable: true,
      });
      return;
    }

    const details = await fetchDetails(type, item.id);

    const data = {
      id: details?.id,
      title: details?.title || details?.name,
      type: type,
      poster_path: details?.poster_path,
      release_date: details?.release_date || details?.first_air_date,
      vote_average: details?.vote_average,
      overview: details?.overview,
      saved_at: new Date().toISOString(),
      runtime: details?.runtime || details?.number_of_episodes,
      genres: details?.genres?.map((genre) => genre.name) || [],
    };

    const dataId = details?.id?.toString();
    await addToWatchlist(user?.uid, dataId, data);
  };

  const handleRemoveClick = (event) => {
    event.preventDefault(); // Prevent the default behavior (link redirection)
    removeFromWatchlist(user?.uid, item.id).then(() => {
      setWatchlist((prev) => prev.filter((el) => el.id !== item.id));
    });
  };

  const handleWatchedClick = async (event) => {
    event.preventDefault();
    await moveToWatchedFilmsFromWatchlist(user?.uid, item.id.toString());
    setWatchlist((prev) => prev.filter((el) => el.id !== item.id));
  };

  return (
    <Link to={`/${type}/${item?.id}`}>
      <Box position={"relative"} overflow={"hidden"}>
        <Box
          position={"relative"}
          transform={"scale(1)"}
          overflow={"hidden"}
          maxH={"355.2px"}
          transition={"transform 0.1s ease-in-out"}
          _hover={{
            transform: { base: "scale(1)", md: "scale(1.03)" },
            // transition: "transform 0.2s ease-in-out",
            zIndex: 10,
            "& .overlay": {
              opacity: 0,
              "@media (min-width: 48em)": {
                opacity: 1,
              },
            },
          }}
        >
          <Image
            src={`${imagePath}/${item?.poster_path}`}
            alt={item?.title || item?.name}
            height={"auto"}
            width={"100%"}
            minH={{ base: "256.5px", md: "355.19px" }}
          />
          {isEnabled !== "false" && isEnabled !== "watchlist" && (
            <Box
              className="overlay"
              opacity={"0"}
              position="absolute"
              top="2"
              right="2"
              display="flex"
              gap="2"
            >
              <Tooltip label="Watch Later" hasArrow>
                <IconButton
                  aria-label="Watch Later"
                  icon={<MdOutlineWatchLater />}
                  size="sm"
                  colorScheme="blue"
                  variant="solid"
                  onClick={(e) => handleAddToWatchLater(e)}
                />
              </Tooltip>
              <Tooltip label="Add to Watched" hasArrow>
                <IconButton
                  aria-label="Add to Watched"
                  icon={<AiOutlineCheckCircle />}
                  size="sm"
                  colorScheme="purple"
                  variant="solid"
                  onClick={(e) => handleAddToWatched(e)}
                />
              </Tooltip>
            </Box>
          )}
          {isEnabled !== "false" && isEnabled === "watchlist" && (
            <Box
              className="overlay"
              opacity={"0"}
              position="absolute"
              top="2"
              left="2"
              display={"flex"}
              gap={"2"}
            >
              <Tooltip label="Remove from watchlist">
                <IconButton
                  aria-label="Remove from watchlist"
                  icon={<DeleteIcon />}
                  size={"sm"}
                  colorScheme="red"
                  variant="solid"
                  // position={"absolute"}
                  // className="overlay"
                  // opacity={"0"}
                  // zIndex={"999"}
                  // top="2px"
                  // left={"2px"}
                  onClick={handleRemoveClick}
                />
              </Tooltip>
              <Tooltip label="Watched">
                <IconButton
                  aria-label="Watched"
                  icon={<CheckIcon />}
                  size={"sm"}
                  colorScheme="green"
                  variant="solid"
                  // position={"absolute"}
                  // className="overlay"
                  // opacity={"0"}
                  // zIndex={"999"}
                  // top="2px"
                  // left={"2px"}
                  onClick={handleWatchedClick}
                />
              </Tooltip>
            </Box>
          )}
          <Box
            className="overlay"
            position={"absolute"}
            p={"2"}
            bottom={"0"}
            left={"0"}
            w={"100%"}
            h={"25%"}
            bg={"rgba(0,0,0,0.9)"}
            opacity={"0"}
            transition={"opacity 0.3s ease-in-out"}
          >
            <Text textAlign={"center"} noOfLines={"1"} color={"white"}>
              {item?.title || item?.name}
            </Text>
            <Text
              textAlign={"center"}
              fontSize={"x-small"}
              color={"purple.200"}
            >
              {new Date(
                item?.release_date || item?.first_air_date
              ).getFullYear() || "N/A"}
            </Text>
            {/* <Box flex="1" /> */}
            <Flex
              alignItems={"center"}
              justifyContent={"center"}
              gap={"2"}
              mt={"1"}
              // mb={"5"}
            >
              <StarIcon fontSize={"small"} color={"white"} />
              <Text color={"white"}>{item?.vote_average?.toFixed(1)}</Text>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Link>
  );
};

export default CardComponent;
