import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Skeleton,
  Spinner,
} from "@chakra-ui/react";
import { searchData } from "../../services/api";
import CardComponent from "../../components/CardComponent";
import PaginationComponent from "../../components/PaginationComponent";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [tempSearchValue, setTempSearchValue] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const itemsPerPage = 20; // Standard API page size

  // useEffect(() => {
  //   setIsLoading(true);
  //   searchData(searchValue, activePage)
  //     .then((res) => {
  //       console.log(res, "res");
  //       setData(res?.results);
  //       setActivePage(res?.page);
  //       setTotalPages(res?.total_pages);
  //     })
  //     .catch((err) => console.log(err, "err"))
  //     .finally(() => setIsLoading(false));
  // }, [searchValue, activePage]);
  // Function to fetch data from API
  const fetchData = useCallback(async (query, page) => {
    try {
      const res = await searchData(query, page);
      return {
        results: res?.results || [],
        totalPages: res?.total_pages || 1,
        page: res?.page || 1,
      };
    } catch (err) {
      console.log(err, "err");
      return { results: [], totalPages: 1, page: 1 };
    }
  }, []);

  // Function to load enough valid items to fill a page
  const loadEnoughItems = useCallback(
    async (query, page) => {
      setIsLoading(true);
      let currentPage = page;
      let allItemsCollected = [];
      let totalPagesFromAPI = 1;
      let allValidItemsCollected = [];
      let totalItemsFromAPI = 0;

      // Start by finding out how many total pages exist
      const initialData = await fetchData(query, 1);
      totalPagesFromAPI = initialData.totalPages;

      // Estimate total items (standard API returns 20 items per page)
      totalItemsFromAPI = totalPagesFromAPI * itemsPerPage;

      // First approach: Try to load all pages that we need for proper calculation
      // For better performance, we'll try to load at least enough pages to show the current page
      // plus one additional page to ensure we have enough items for accurate calculation

      // Calculate how many pages we should load at minimum
      const pagesToLoadInitially = Math.min(page + 1, totalPagesFromAPI);

      // Load initial batch of pages
      for (let pageNum = 1; pageNum <= pagesToLoadInitially; pageNum++) {
        const pageData =
          pageNum === 1 ? initialData : await fetchData(query, pageNum);

        // Filter valid items with poster_path
        const pageValidItems = pageData.results.filter(
          (item) => item?.poster_path
        );

        // Add all items to our collection for pagination calculation
        allItemsCollected = [...allItemsCollected, ...pageData.results];

        // Add valid items to our total valid items collection
        allValidItemsCollected = [...allValidItemsCollected, ...pageValidItems];
      }

      // Calculate start index based on itemsPerPage
      const startIndex = (page - 1) * itemsPerPage;

      // If we need more items to fill the current page
      if (
        startIndex + itemsPerPage > allValidItemsCollected.length &&
        page <= totalPagesFromAPI
      ) {
        // Load additional pages until we have enough items or reach the end
        let nextPage = pagesToLoadInitially + 1;

        while (
          allValidItemsCollected.length < startIndex + itemsPerPage &&
          nextPage <= totalPagesFromAPI
        ) {
          const pageData = await fetchData(query, nextPage);

          // Filter valid items with poster_path
          const pageValidItems = pageData.results.filter(
            (item) => item?.poster_path
          );

          // Add all items to our collections
          allItemsCollected = [...allItemsCollected, ...pageData.results];
          allValidItemsCollected = [
            ...allValidItemsCollected,
            ...pageValidItems,
          ];

          nextPage++;
        }
      }

      // Get the appropriate slice of items for the current page
      const itemsToShow = allValidItemsCollected.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      // Use our ratio of valid items to estimate total valid items
      const validItemRatio =
        allValidItemsCollected.length / allItemsCollected.length;
      const estimatedTotalValidItems = Math.floor(
        totalItemsFromAPI * validItemRatio
      );

      // Calculate adjusted total pages based on estimated total valid items
      const adjustedTotalPages = Math.ceil(
        estimatedTotalValidItems / itemsPerPage
      );

      // Ensure we never go below the current page to avoid breaking pagination
      const finalTotalPages = Math.max(adjustedTotalPages, page);

      // Update state
      setData(itemsToShow);
      setAllData(allItemsCollected);
      setFilteredData(allValidItemsCollected);
      setTotalPages(finalTotalPages);
      setIsLoading(false);
    },
    [fetchData]
  );

  // Calculate the correct starting page based on filtered items
  const getPageForActivePage = useCallback((activePage, allItems) => {
    const validItems = allItems.filter((item) => item?.poster_path);
    const totalValidItems = validItems.length;
    const startIndex = (activePage - 1) * itemsPerPage;

    if (startIndex >= totalValidItems) {
      return Math.ceil(totalValidItems / itemsPerPage) || 1;
    }
    return activePage;
  }, []);

  useEffect(() => {
    if (searchValue) {
      // Reset to page 1 if search value changes
      if (activePage !== 1 && tempSearchValue !== searchValue) {
        setActivePage(1);
      } else {
        loadEnoughItems(searchValue, activePage);
      }
    }
  }, [searchValue, activePage, loadEnoughItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActivePage(1);
    setSearchValue(tempSearchValue);
  };

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"10"}>
        <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
          Search
        </Heading>
      </Flex>

      <form onSubmit={handleSearch}>
        <Input
          placeholder={"Search movies, tv shows..."}
          _placeholder={{ color: "gray.subtle" }}
          value={tempSearchValue}
          onChange={(e) => setTempSearchValue(e.target.value)}
          mb={"10"}
        />
      </form>

      {isLoading && (
        <Flex justifyContent={"center"} mt={"10"}>
          <Spinner size={"xl"} color="purple.500" />
        </Flex>
      )}

      {data?.length === 0 && !isLoading && (
        <Heading textAlign={"center"} as={"h3"} fontSize={"sm"} mt={"10"}>
          No results found
        </Heading>
      )}

      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)", //"1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={"4"}
      >
        {data?.length > 0 &&
          !isLoading &&
          data
            // ?.filter((item) => item?.poster_path)
            ?.map((item, i) =>
              isLoading ? (
                <Skeleton height={"355"} key={i} />
              ) : (
                <CardComponent
                  key={item?.id}
                  item={item}
                  type={item?.media_type}
                />
              )
            )}
      </Grid>

      {filteredData?.length > 0 && !isLoading && (
        <Flex justifyContent={"center"}>
          <PaginationComponent
            activePage={activePage}
            totalPages={totalPages}
            setActivePage={setActivePage}
          />
        </Flex>
      )}
    </Container>
  );
};

export default Search;
