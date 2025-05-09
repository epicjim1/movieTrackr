import {
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  // Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Spinner,
  Text,
  IconButton,
  useDisclosure,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  AlertDialog,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFirestore } from "../services/firestore";
import { useAuth } from "../context/useAuth";
import React, { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent";
import PaginationComponent from "../components/PaginationComponent";
import { minutesToHours } from "../utils/helpers";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { useSearchParams } from "react-router-dom";

const WatchedFilms = () => {
  const { getWatchedFilms, deleteWatchedFilms } = useFirestore();
  const { user } = useAuth();
  const [originalWatchedFilms, setOriginalWatchedFilms] = useState([]);
  const [watchedFilms, setWatchedFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 30;

  const [searchParams, setSearchParams] = useSearchParams();
  const [filterByType, setFilterByType] = useState("all");
  const [sortBy, setSortBy] = useState("saved_at.desc");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sliderValue, setSliderValue] = useState(240);
  const [runtimeFilter, setRuntimeFilter] = useState(240);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      getWatchedFilms(user?.uid)
        .then((data) => {
          console.log(data, "data");
          setOriginalWatchedFilms(data);
          setWatchedFilms(data);
        })
        .catch((err) => {
          console.log(err, "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user?.uid, getWatchedFilms]);

  useEffect(() => {
    const type = searchParams.get("type") || "all";
    const sort = searchParams.get("sort") || "saved_at.desc";
    const order = searchParams.get("order") || "desc";
    const genres = searchParams.get("genres")?.split(",") || [];
    const runtime = parseInt(searchParams.get("runtime")) || 240;
    const page = parseInt(searchParams.get("page")) || 1;

    setFilterByType(type);
    setSortBy(sort);
    setSortOrder(order);
    setSelectedGenres(genres);
    setRuntimeFilter(runtime);
    setSliderValue(runtime);
    setActivePage(page);
  }, [searchParams]);

  useEffect(() => {
    const params = {
      type: filterByType,
      sort: sortBy,
      order: sortOrder,
      genres: selectedGenres.length > 0 ? selectedGenres.join(",") : [],
      runtime: runtimeFilter,
      page: activePage,
    };

    setSearchParams(params);
  }, [
    filterByType,
    sortBy,
    sortOrder,
    selectedGenres,
    runtimeFilter,
    activePage,
  ]);

  useEffect(() => {
    // setIsLoading(true);
    if (originalWatchedFilms.length === 0) return;

    let updated = [...originalWatchedFilms];

    // First: Apply filtering
    if (filterByType === "tv") {
      updated = updated.filter((film) => film.type === "tv");
    } else if (filterByType === "movie") {
      updated = updated.filter((film) => film.type === "movie");

      // Also filter by runtime (only for movies)
      if (runtimeFilter < 240) {
        updated = updated.filter((film) => {
          const runtime = film.runtime || 0;
          return runtime <= runtimeFilter;
        });
      }
    }

    // Single select genre filter
    // if (selectedGenres !== "All") {
    //   updated = updated.filter((film) => {
    //     // console.log(film?.genres, "movie");
    //     return film.genres?.includes(selectedGenres);
    //   });
    // }
    // console.log(selectedGenres, "genre state length");
    if (selectedGenres.length > 0) {
      updated = updated.filter((film) => {
        if (selectedGenres.length === 1) {
          // OR logic: film must have at least the one selected genre
          return film.genres?.includes(selectedGenres[0]);
        } else {
          // AND logic: film must include all selected genres
          return selectedGenres.every((genre) => film.genres?.includes(genre));
        }
      });
    }

    // Then: Apply sorting
    if (sortBy === "saved_at.desc") {
      updated.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
    } else if (sortBy === "vote_average.desc") {
      updated.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === "release_date.desc") {
      updated.sort(
        (a, b) => new Date(b.release_date) - new Date(a.release_date)
      );
    }

    // Reverse if ascending
    if (sortOrder === "asc") {
      updated.reverse();
    }

    setWatchedFilms(updated);
    setIsLoading(false);
  }, [
    filterByType,
    sortBy,
    sortOrder,
    selectedGenres,
    runtimeFilter,
    originalWatchedFilms,
  ]);

  const totalPages = Math.ceil((watchedFilms?.length || 0) / itemsPerPage);
  // Slice the watchlist based on the active page
  const paginatedWatchedFilmsList = watchedFilms?.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  useEffect(() => {
    if (totalPages > 0 && activePage > totalPages) {
      setActivePage(totalPages);
    } else if (totalPages === 0 && activePage !== 1) {
      setActivePage(1); // Reset back to page 1 if there’s no data
    }
  }, [watchedFilms, totalPages]);

  const genreOptions = [
    { value: "Action", label: "Action" },
    { value: "Adventure", label: "Adventure" },
    { value: "Action & Adventure", label: "Action & Adventure" },
    { value: "Animation", label: "Animation" },
    { value: "Comedy", label: "Comedy" },
    { value: "Crime", label: "Crime" },
    { value: "Documentary", label: "Documentary" },
    { value: "Drama", label: "Drama" },
    { value: "Family", label: "Family" },
    { value: "Fantasy", label: "Fantasy" },
    { value: "History", label: "History" },
    { value: "Horror", label: "Horror" },
    { value: "Music", label: "Music" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Science Fiction", label: "Science Fiction" },
    { value: "Sci-Fi & Fantasy", label: "Sci-Fi & Fantasy" },
    { value: "Thriller", label: "Thriller" },
    { value: "War", label: "War" },
    { value: "Western", label: "Western" },
  ];

  return (
    <Container maxW={"container.xl"}>
      <Flex
        alignItems={"baseline"}
        gap={"4"}
        my={"10"}
        overflow={{ base: "visible", md: "visible" }}
      >
        <Flex direction={"column"} gap={"3"} justifyContent={"center"}>
          <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
            Watched List
          </Heading>
          <Text fontStyle={"italic"}>{watchedFilms?.length} Films/Shows</Text>
        </Flex>
        <Divider
          // display={{ base: "none", md: "auto" }}
          orientation="vertical"
          height="auto"
          alignSelf="stretch"
          borderColor="whiteAlpha.400"
          m={"0px 5px"}
        />
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: "2", md: "4" }}
        >
          <Flex
            direction={{ base: "row", md: "column" }}
            align={{ base: "center", md: "normal" }}
            gap="1"
            maxW={{ base: "244px", md: "100px" }}
          >
            <Text fontWeight="bold" w={"70px"}>
              Type:
            </Text>
            <Select
              focusBorderColor="purple.500"
              onChange={(e) => {
                setActivePage(1);
                setFilterByType(e ? e.value : "all");
              }}
              isSearchable={false}
              // defaultValue={{ value: "all", label: "All" }}
              value={[
                { value: "all", label: "All" },
                { value: "tv", label: "TV Shows" },
                { value: "movie", label: "Films" },
              ].find((opt) => opt.value === filterByType)}
              options={[
                { value: "all", label: "All" },
                { value: "tv", label: "TV Shows" },
                { value: "movie", label: "Films" },
              ]}
              chakraStyles={{
                valueContainer: (provided) => ({
                  ...provided,
                  width: ["150px", "150px", "325px"],
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
                  // fontWeight: state.isSelected ? "bold" : "normal",
                  backgroundColor: state.isSelected
                    ? "purple.500" // background for selected
                    : "auto",
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 999, // Very high value to ensure it appears on top
                }),
              }}
            />
          </Flex>
          <Flex
            direction={{ base: "row", md: "column" }}
            gap="1"
            maxW={{ base: "244px", md: "125px" }}
            align={{ base: "center", md: "normal" }}
          >
            <Text fontWeight="bold" w={"70px"}>
              Sort By:
            </Text>
            <Select
              focusBorderColor="purple.500"
              onChange={(e) => {
                setActivePage(1);
                setSortBy(e.value);
              }}
              isSearchable={false}
              // defaultValue={{ value: "saved_at.desc", label: "When Added" }}
              value={[
                { value: "saved_at.desc", label: "When Added" },
                { value: "vote_average.desc", label: "Rating" },
                { value: "release_date.desc", label: "Release Date" },
              ].find((opt) => opt.value === sortBy)}
              options={[
                { value: "saved_at.desc", label: "When Added" },
                { value: "vote_average.desc", label: "Rating" },
                { value: "release_date.desc", label: "Release Date" },
              ]}
              chakraStyles={{
                valueContainer: (provided) => ({
                  ...provided,
                  width: ["150px", "150px", "325px"],
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
                  // fontWeight: state.isSelected ? "bold" : "normal",
                  backgroundColor: state.isSelected
                    ? "purple.500" // background for selected
                    : "auto",
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 999, // Very high value to ensure it appears on top
                }),
              }}
            />
          </Flex>
          <Flex
            direction={{ base: "row", md: "column" }}
            gap="1"
            maxW={{ base: "244px", md: "100px" }}
            align={{ base: "center", md: "normal" }}
          >
            <Text fontWeight="bold" w={"70px"}>
              Order:
            </Text>
            <Select
              focusBorderColor="purple.500"
              onChange={(e) => {
                setActivePage(1);
                setSortOrder(e.value);
              }}
              isSearchable={false}
              // defaultValue={{ value: "desc", label: "Descending" }}
              value={[
                { value: "desc", label: "Descending" },
                { value: "asc", label: "Ascending" },
              ].find((opt) => opt.value === sortOrder)}
              options={[
                { value: "desc", label: "Descending" },
                { value: "asc", label: "Ascending" },
              ]}
              chakraStyles={{
                valueContainer: (provided) => ({
                  ...provided,
                  width: ["150px", "150px", "325px"],
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
                  backgroundColor: state.isSelected ? "purple.500" : "auto",
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 999, // Very high value to ensure it appears on top
                }),
              }}
            />
          </Flex>
          <Flex
            direction={{ base: "row", md: "column" }}
            gap="1"
            maxW={{ base: "244px", md: "300px" }}
            align={{ base: "center", md: "normal" }}
          >
            <Text fontWeight="bold" w={"70px"}>
              Genres:
            </Text>
            <Select
              isMulti
              onChange={(e) => {
                setActivePage(1);
                setSelectedGenres(e.map((option) => option.value));
              }}
              value={genreOptions.filter((opt) =>
                selectedGenres.includes(opt.value)
              )}
              focusBorderColor="purple.500"
              options={genreOptions}
              placeholder="Select some genres..."
              chakraStyles={{
                control: (provided) => ({
                  ...provided,
                  maxW: ["174.89px", null, "325px"],
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  maxHeight: "38px",
                  overflowY: "auto",
                  flexWrap: "wrap",
                  width: ["150px", null, "325px"],
                }),
                multiValue: (provided) => ({
                  ...provided,
                  margin: "2px",
                }),
                // menu: (provided) => ({
                //   ...provided,
                //   my: 0,
                //   borderTopLeftRadius: 0,
                //   borderTopRightRadius: 0,
                //   borderWidth: "1px",
                //   borderBottomRadius: "md",
                //   maxH: "200px",
                // }),
                // menuList: (provided) => ({
                //   ...provided,
                //   borderTopLeftRadius: 0,
                //   borderTopRightRadius: 0,
                //   borderWidth: 0,
                //   maxH: "200px",
                // }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 999, // Very high value to ensure it appears on top
                }),
              }}
            />
          </Flex>
          <Flex
            direction={{ base: "row", md: "column" }}
            gap="4"
            mt={{ base: "25px", md: "0px" }}
            ml={{ base: "0px", md: "10px" }}
            mr={{ base: "0px", md: "40px" }}
            mb={{ base: "25px", md: "0px" }}
            maxW={{ base: "200px", md: "325px" }}
            align={{ base: "center", md: "normal" }}
            w={{ base: "224px", md: "250px" }}
          >
            <Text
              fontWeight="bold"
              w={"70px"}
              color={filterByType !== "movie" ? "gray.800" : "white"}
            >
              Runtime:
            </Text>
            <Slider
              aria-label="slider-ex-6"
              value={sliderValue}
              onChange={(val) => setSliderValue(val)}
              onChangeEnd={(val) => setRuntimeFilter(val)}
              min={0}
              max={240}
              step={30}
              isDisabled={filterByType !== "movie"}
            >
              {/* <SliderMark value={0} mt={"2"} ml={"-2.5"} fontSize={"sm"}>
                {minutesToHours(0)}
              </SliderMark>
              <SliderMark value={60} mt={"2"} ml={"-2.5"} fontSize={"sm"}>
                {minutesToHours(60)}
              </SliderMark>
              <SliderMark value={120} mt={"2"} ml={"-2.5"} fontSize={"sm"}>
                {minutesToHours(120)}
              </SliderMark>
              <SliderMark value={180} mt={"2"} ml={"-2.5"} fontSize={"sm"}>
                {minutesToHours(180)}
              </SliderMark>
              <SliderMark value={300} mt={"2"} ml={"-2.5"} fontSize={"sm"}>
                {minutesToHours(300)}
              </SliderMark> */}
              <SliderMark
                display={{ base: "none", md: "block" }}
                value={90}
                mt={"2"}
                ml={"-5"}
                fontSize={"sm"}
              >
                {minutesToHours(90)}
              </SliderMark>
              <SliderMark
                display={{ base: "none", md: "block" }}
                value={150}
                mt={"2"}
                ml={"-2.5"}
                fontSize={"sm"}
              >
                {minutesToHours(150)}
              </SliderMark>
              <SliderMark
                value={sliderValue}
                textAlign="center"
                bg="purple.500"
                color="white"
                mt="-10"
                ml="-7"
                w="60px"
                // overflow={"hidden"}
              >
                {sliderValue < 240 ? minutesToHours(sliderValue) : "4h+"}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg="purple.500" />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
          </Flex>
          {/* <Flex
            direction={{ base: "row", md: "column" }}
            gap="1"
            maxW={{ base: "244px", md: "325px" }}
            align={{ base: "center", md: "normal" }}
          >
            <Text fontWeight="bold" w={"90px"}>
              Delete List:
            </Text>
            <IconButton
              variant="solid"
              colorScheme="red"
              aria-label="Delete List"
              onClick={onOpen}
              icon={<DeleteIcon />}
            />
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Enitre Watched List
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You can't undo this action afterwards.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={async () => {
                        await deleteWatchedFilms(user?.uid); // first delete the watched films
                        onClose(); // then close the modal
                        setTimeout(() => {
                          window.location.reload();
                        }, 200);
                      }}
                      ml={3}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Flex> */}
        </Flex>
      </Flex>
      {isLoading && (
        <Flex justify={"center"} mt={"10"}>
          <Spinner size={"xl"} color="purple.500" />
        </Flex>
      )}
      {!isLoading && watchedFilms?.length === 0 && (
        <Flex justify={"center"} mt={"10"}>
          <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
            You havent watched anything!
          </Heading>
        </Flex>
      )}
      {!isLoading && watchedFilms?.length > 0 && (
        <>
          <Grid
            templateColumns={{
              base: "repeat(2, 1fr)", //"1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            }}
            gap={"4"}
          >
            {paginatedWatchedFilmsList?.map((item) =>
              isLoading ? (
                <Skeleton height={"355"} key={i} />
              ) : (
                <CardComponent
                  key={item?.id}
                  item={item}
                  type={item?.type}
                  isEnabled={"false"}
                />
              )
            )}
          </Grid>

          {/* Show Pagination only if there are more than 1 page */}
          {totalPages > 1 && (
            <Flex justifyContent={"center"}>
              <PaginationComponent
                activePage={activePage}
                totalPages={totalPages}
                setActivePage={setActivePage}
              />
            </Flex>
          )}
        </>
      )}
    </Container>
  );
};

export default WatchedFilms;
