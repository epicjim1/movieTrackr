import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Spinner,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  fetchCredits,
  fetchDetails,
  fetchVideos,
  imagePath,
  imagePathOriginal,
} from "../services/api";
import {
  CalendarIcon,
  CheckCircleIcon,
  SmallAddIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import {
  minutesToHours,
  ratingToPercentage,
  resolveRatingColor,
} from "../utils/helpers";
import VideoComponent from "../components/VideoComponent";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../services/firestore";
import { Select } from "chakra-react-select";

const DetailsPage = () => {
  const router = useParams();
  const { type, id } = router;

  const { user } = useAuth();
  const {
    addToWatchlist,
    checkIfInWatchlist,
    removeFromWatchlist,
    addToWatchedFilms,
    checkIfInWatchedFilms,
    removeFromWatchedFilms,
    getIllegalMode,
  } = useFirestore();
  const toast = useToast();

  const [details, setDetails] = useState({});
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState("");
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isInWatchedFilms, setIsInWatchedFilms] = useState(false);
  const [illegalMode, setIllegalMode] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const orientation = useBreakpointValue(
    {
      base: "horizontal",
      md: "vertical",
    },
    {
      fallback: "md",
    }
  );

  // useEffect(() => {
  //   setLoading(true);
  //   fetchDetails(type, id)
  //     .then((res) => {
  //       console.log(res, "res");
  //       setdetails(res);
  //     })
  //     .catch((err) => {
  //       console.log("err");
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, [type, id]);

  const imdbId = details?.imdb_id || details?.id;
  const pluginRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const scriptId = "imdb-rating-api";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src =
        "https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/js/rating.js";
      script.async = true;
      script.id = scriptId;
      document.body.appendChild(script);
    } else if (window.IMDbPlugin) {
      window.IMDbPlugin.reload();
    }
    setLoading(false);
  }, [imdbId]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [detailsData, creditsData, videosData] = await Promise.all([
          fetchDetails(type, id),
          fetchCredits(type, id),
          fetchVideos(type, id),
        ]);

        // Set details
        setDetails(detailsData);
        console.log(detailsData, "details");

        // Set cast
        setCast(creditsData?.cast?.slice(0, 25));
        const d =
          type === "movie"
            ? "Directed by: " +
              (creditsData?.crew?.find((member) => member?.job === "Director")
                ?.name || "n/a")
            : "Created by: " +
              (detailsData?.created_by
                ?.map((creator) => creator?.name)
                .join(", ") || "n/a");
        console.log(d);
        setDirector(d);
        console.log(creditsData, "credits");

        // Set video/s
        const video = videosData?.results?.find(
          (video) => video?.type === "Trailer"
        );
        setVideo(video);
        const videos = videosData?.results
          ?.filter((video) => video?.type !== "Trailer")
          ?.slice(0, 10);
        setVideos(videos);

        // if (user?.uid) {
        //   const mode = await getIllegalMode(user.uid);
        //   setIllegalMode(mode);
        // }
      } catch (error) {
        console.log(error, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  // console.log(video, videos, "videos");

  useEffect(() => {
    const loadIllegalMode = async () => {
      if (user?.uid) {
        const value = await getIllegalMode(user.uid);
        setIllegalMode(value);
      }
    };

    loadIllegalMode();
  }, [user?.uid]);

  const handleSaveToWatchlist = async () => {
    if (!user) {
      toast({
        title: "Login to add to watch later",
        status: "error",
        isClosable: true,
      });
      return;
    }

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

    // console.log(data, "data");
    // addDocument("watchlist", data);
    const dataId = details?.id?.toString();
    await addToWatchlist(user?.uid, dataId, data);
    const isSetToWatchlist = await checkIfInWatchlist(user?.uid, dataId);
    setIsInWatchlist(isSetToWatchlist);
  };

  useEffect(() => {
    if (!user) {
      setIsInWatchlist(false);
      setIsInWatchedFilms(false);
      return;
    }

    checkIfInWatchlist(user?.uid, id).then((data) => {
      setIsInWatchlist(data);
    });

    checkIfInWatchedFilms(user?.uid, id).then((data) => {
      setIsInWatchedFilms(data);
    });
  }, [id, user, checkIfInWatchlist, checkIfInWatchedFilms]);

  const handleRemoveFromWatchlist = async () => {
    await removeFromWatchlist(user?.uid, id);
    const isSetToWatchlist = await checkIfInWatchlist(user?.uid, id);
    setIsInWatchlist(isSetToWatchlist);
  };

  const handleSaveToWatchedFilms = async () => {
    if (!user) {
      toast({
        title: "Login to add to watched list",
        status: "error",
        isClosable: true,
      });
      return;
    }

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

    // console.log(data, "data");
    // addDocument("watchlist", data);
    const dataId = details?.id?.toString();
    await addToWatchedFilms(user?.uid, dataId, data);
    const isSetToWatchlist = await checkIfInWatchedFilms(user?.uid, dataId);
    setIsInWatchedFilms(isSetToWatchlist);
  };

  const handleRemoveFromWatchedFilms = async () => {
    await removeFromWatchedFilms(user?.uid, id);
    const isSetToWatchedFilms = await checkIfInWatchedFilms(user?.uid, id);
    setIsInWatchedFilms(isSetToWatchedFilms);
  };

  if (loading) {
    return (
      <Flex justify={"center"}>
        <Spinner size={"xl"} color="purple.500" />
      </Flex>
    );
  }

  const title = details?.title || details?.name;
  const releaseDate =
    type === "tv" ? details?.first_air_date : details?.release_date;
  // const Director = type === "tv" ? details?.created_by : director;
  // console.log(director);

  const seasonOptions = details?.seasons
    ?.filter((s) => s.season_number > 0) // skip "Specials"
    ?.map((s) => ({
      value: s.season_number,
      label: `Season ${s.season_number}`,
    }));

  const seasonData = details?.seasons?.find(
    (s) => s.season_number === selectedSeason
  );

  return (
    <Box>
      <Box
        background={`linear-gradient(rgba(0, 0, 0, .88), rgba(0, 0, 0, .88)), url(${imagePathOriginal}/${details?.backdrop_path})`}
        backgroundRepeat={"no-repeat"}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
        w={"100%"}
        h={{ base: "auto", md: "500px" }}
        py={"2"}
        zIndex={"-1"}
        display={"flex"}
        alignItems={"center"}
      >
        <Container maxW={"container.xl"}>
          <Flex
            alignItems={"center"}
            gap={"10"}
            flexDirection={{ base: "column", md: "row" }}
          >
            <Image
              height={"450px"}
              borderRadius={"sm"}
              src={`${imagePath}/${details?.poster_path}`}
            />
            <Box>
              <Heading fontSize={"3xl"} color={"white"}>
                {title}{" "}
                <Text as={"span"} fontWeight={"normal"} color={"purple.200"}>
                  {new Date(releaseDate).getFullYear()}
                </Text>
              </Heading>

              <Flex alignItems={"center"} gap={"4"} mt={"1"} mb={"5"}>
                <Flex alignItems={"center"}>
                  <CalendarIcon mr={"2"} color={"gray.400"} />
                  <Text fontSize={"sm"} color={"white"}>
                    {new Date(releaseDate).toLocaleDateString("en-US")} (US)
                  </Text>
                </Flex>

                {type === "movie" && (
                  <>
                    <Box color={"white"}>*</Box>
                    <Flex alignItems={"center"}>
                      <TimeIcon mr={"2"} color={"gray.400"} />
                      <Text fontSize={"sm"} color={"white"}>
                        {minutesToHours(details?.runtime)}
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>

              <Flex alignItems={"center"} gap={"4"}>
                <CircularProgress
                  value={ratingToPercentage(details?.vote_average)}
                  bg={"gray.800"}
                  borderRadius={"full"}
                  p={"0.5"}
                  size={"70px"}
                  color={resolveRatingColor(details?.vote_average)}
                  thickness={"6px"}
                >
                  <CircularProgressLabel fontSize={"lg"} color={"white"}>
                    {ratingToPercentage(details?.vote_average)}
                    <Box as="span" fontSize={"10px"} ml={"1"}>
                      %
                    </Box>
                  </CircularProgressLabel>
                </CircularProgress>
                <Text display={{ base: "none", md: "initial" }} color={"white"}>
                  User Score
                </Text>
                <Flex wrap={"wrap"} gap={{ base: "1", md: "4" }}>
                  {isInWatchedFilms ? (
                    <Button
                      leftIcon={<CheckCircleIcon />}
                      colorScheme="purple"
                      variant={"outline"}
                      onClick={handleRemoveFromWatchedFilms}
                    >
                      In Watched List
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<SmallAddIcon />}
                      variant={"outline"}
                      onClick={handleSaveToWatchedFilms}
                      color={"white"}
                      borderColor="whiteAlpha.300"
                      _hover={{ bg: "whiteAlpha.200", color: "white" }}
                    >
                      Add to Watched List
                    </Button>
                  )}
                  {isInWatchlist ? (
                    <Button
                      leftIcon={<CheckCircleIcon />}
                      colorScheme="blue"
                      variant={"outline"}
                      onClick={handleRemoveFromWatchlist}
                    >
                      In Watch Later
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<SmallAddIcon />}
                      variant={"outline"}
                      onClick={handleSaveToWatchlist}
                      color={"white"}
                      borderColor="whiteAlpha.300"
                      _hover={{
                        bg: "whiteAlpha.200",
                        color: "white",
                      }}
                    >
                      Add to Watch Later
                    </Button>
                  )}
                </Flex>
              </Flex>
              <Flex alignItems="center" gap={3}>
                {details?.imdb_id && (
                  <span
                    class="imdbRatingPlugin"
                    data-user="ur200783260"
                    data-title={imdbId}
                    data-style="p1"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <a
                      href={`https://www.imdb.com/title/${imdbId}/?ref_=plg_rt_1`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"
                        alt="Prey (2022) on IMDb"
                      />
                    </a>
                  </span>
                )}
                <Text
                  color={"gray.400"}
                  fontSize={"sm"}
                  fontStyle={"italic"}
                  my={"5"}
                >
                  {details?.tagline}
                </Text>
              </Flex>
              <Heading fontSize={"xl"} mb={"3"} color={"white"}>
                Overview
              </Heading>
              <Text fontSize={"md"} mb={"3"} color={"white"}>
                {details?.overview}
              </Text>
              <Flex mt={"6"} gap={"2"} flexWrap={"wrap"}>
                {details?.genres?.map((genre) => (
                  <Badge
                    key={genre?.id}
                    p={"1"}
                    color={"white"}
                    bg={"whiteAlpha.300"}
                  >
                    {genre?.name}
                  </Badge>
                ))}
              </Flex>
              <Text mt={"4"} color={"white"}>
                {director}
              </Text>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Container maxW={"container.xl"} pb={"10"}>
        <Heading
          as={"h2"}
          fontSize={"medium"}
          textTransform={"uppercase"}
          mt={"10"}
        >
          Cast
        </Heading>
        <Flex mt={"5"} mb={"10"} overflowX={"scroll"} gap={"5"}>
          {cast?.length === 0 && <Text>No cast found</Text>}
          {cast &&
            cast?.map((item) => (
              <Box
                key={item?.id}
                minW={"150px"}
                maxW={"150px"}
                bg={useColorModeValue("blackAlpha.500", "whiteAlpha.200")}
                borderRadius={"10"}
                overflow={"hidden"}
                mb={"5"}
              >
                <Image
                  src={`${imagePath}/${item?.profile_path}`}
                  w={"100%"}
                  maxH={"225px"}
                />
                <Box p={"3"}>
                  <Text fontWeight={"bold"}>{item?.name}</Text>
                  <Text
                    fontStyle={"italic"}
                    color={"purple.200"}
                    fontSize={"sm"}
                  >
                    {item?.character}
                  </Text>
                </Box>
              </Box>
            ))}
        </Flex>

        {imdbId !== null && illegalMode === true && (
          <>
            <Heading
              as={"h2"}
              fontSize={"medium"}
              textTransform={"uppercase"}
              mt={"10"}
              mb={"5"}
            >
              Watch Here
            </Heading>
            {type === "movie" && (
              <Box
                boxShadow="0 0 100px rgba(128, 90, 213, 0.7)" // purple glow
                borderRadius="lg"
                overflow="hidden"
                my={5}
                h={{ base: "201px", md: "702px" }}
              >
                <iframe
                  src={`https://vidsrc.cc/v2/embed/movie/${imdbId}?autoPlay=false`}
                  style={{ width: "100%", height: "100%" }}
                  frameborder="0"
                  referrerpolicy="origin"
                  allowfullscreen
                  allow="fullscreen"
                  sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                ></iframe>
              </Box>
            )}
            {type === "tv" && (
              <>
                <Box
                  boxShadow="0 0 100px rgba(128, 90, 213, 0.7)" // purple glow
                  borderRadius="lg"
                  overflow="hidden"
                  my={5}
                  h={{ base: "201px", md: "702px" }}
                >
                  <iframe
                    // key={`${selectedSeason}-${selectedEpisode}`}
                    src={`https://vidsrc.cc/v2/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}?autoPlay=false`}
                    style={{ width: "100%", height: "100%" }}
                    frameBorder="0"
                    referrerPolicy="origin"
                    allowFullScreen
                    allow="fullscreen"
                    sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                  ></iframe>
                </Box>
                <Flex
                  alignItems={"baseline"}
                  direction={{ base: "column", md: "row" }}
                  gap={"4"}
                  my={"10"}
                  // overflow={{ base: "hidden", md: "visible" }}
                >
                  <Flex
                    direction={"column"}
                    gap={"3"}
                    justifyContent={"center"}
                    minW={{ base: "auto", md: "116px" }}
                  >
                    <Heading
                      as={"h2"}
                      fontSize={"md"}
                      textTransform={"uppercase"}
                    >
                      Seasons:
                    </Heading>
                    <Select
                      focusBorderColor="purple.500"
                      onChange={(e) => {
                        setSelectedSeason(Number(e?.value));
                        setSelectedEpisode(1);
                        console.log(selectedSeason);
                      }}
                      isSearchable={false}
                      defaultValue={seasonOptions?.[0]}
                      options={seasonOptions}
                      chakraStyles={{
                        valueContainer: (provided) => ({
                          ...provided,
                          width: ["150px", "150px", "150px"],
                          zIndex: "2",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          whiteSpace: "nowrap",
                          overflow: "visible",
                          textOverflow: "ellipsis", // already happening, but ensure it's correct
                          maxWidth: "100%", // important to allow the text to stretch
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isSelected ? "purple.100" : "white",
                          backgroundColor: state.isSelected
                            ? "purple.500"
                            : "auto",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 999, // Very high value to ensure it appears on top
                        }),
                      }}
                    />
                  </Flex>
                  <Divider
                    // display={{ base: "none", md: "inline" }}
                    orientation={orientation}
                    height="auto"
                    alignSelf="stretch"
                    borderColor="whiteAlpha.400"
                    m={{ base: "5px 0px", md: "0px 5px" }}
                  />
                  <Flex
                    direction={{ base: "column", md: "column" }}
                    gap={{ base: "3", md: "4" }}
                  >
                    <Heading
                      as={"h2"}
                      fontSize={"md"}
                      textTransform={"uppercase"}
                    >
                      Episodes:
                    </Heading>
                    <Flex gap={{ base: "2", md: "4" }} flexWrap={"wrap"}>
                      {seasonData?.episode_count &&
                        Array.from(
                          { length: seasonData.episode_count },
                          (_, i) => (
                            <Button
                              key={i}
                              size="sm"
                              colorScheme={
                                selectedEpisode === i + 1 ? "purple" : "gray"
                              }
                              onClick={() => setSelectedEpisode(i + 1)}
                            >
                              EP {i + 1}
                            </Button>
                          )
                        )}
                    </Flex>
                  </Flex>
                </Flex>
              </>
            )}
          </>
        )}

        <Heading
          as={"h2"}
          fontSize={"medium"}
          textTransform={"uppercase"}
          mt={"10"}
          mb={"5"}
        >
          Videos
        </Heading>
        <VideoComponent id={video?.key} />
        <Flex mt={"5"} mb={"10"} overflowX={"scroll"} gap={"5"}>
          {videos &&
            videos?.map((item) => (
              <Box key={item?.id} minW={"290px"}>
                <VideoComponent id={item?.key} small />
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  mt={"2"}
                  noOfLines={"2"}
                >
                  {item?.name}
                </Text>
              </Box>
            ))}
        </Flex>
      </Container>
    </Box>
  );
};

export default DetailsPage;
