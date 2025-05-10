import {
  Container,
  Flex,
  Grid,
  Heading,
  // Select,
  Skeleton,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect, useState } from "react";
import { fetchMovies } from "../../services/api";
import CardComponent from "../../components/CardComponent";
import PaginationComponent from "../../components/PaginationComponent";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchMovies(activePage, sortBy)
      .then((res) => {
        console.log(res, "res");
        setMovies(res?.results);
        setActivePage(res?.page);
        setTotalPages(res?.total_pages);
      })
      .catch((err) => console.log(err, "err"))
      .finally(() => setIsLoading(false));
  }, [activePage, sortBy]);

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"7"}>
        <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
          Discover Movies
        </Heading>

        {/* <Select
          w={"130px"}
          onChange={(e) => {
            setActivePage(1);
            setSortBy(e.target.value);
          }}
        >
          <option value={"popularity.desc"}>Popular</option>
          <option value={"vote_average.desc&vote_count.gte=1000"}>
            Top Rated
          </option>
        </Select> */}
        <Select
          focusBorderColor="purple.500"
          onChange={(e) => {
            setActivePage(1);
            setSortBy(e.value);
          }}
          defaultValue={{ value: "popularity.desc", label: "Popular" }}
          isSearchable={false}
          options={[
            { value: "popularity.desc", label: "Popular" },
            {
              value: "vote_average.desc&vote_count.gte=1000",
              label: "Top Rated",
            },
          ]}
          chakraStyles={{
            valueContainer: (provided) => ({
              ...provided,
              width: "130px",
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
        ></Select>
      </Flex>

      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)", //"1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={"4"}
      >
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => (
              <Skeleton height={{ base: "256px", md: "355px" }} key={i} />
            ))
          : movies?.map((item) => (
              <CardComponent key={item?.id} item={item} type={"movie"} />
            ))}
      </Grid>
      {/* Pageination */}
      <Flex justifyContent={"center"}>
        <PaginationComponent
          activePage={activePage}
          totalPages={totalPages}
          setActivePage={setActivePage}
        />
      </Flex>
    </Container>
  );
};

export default Movies;
