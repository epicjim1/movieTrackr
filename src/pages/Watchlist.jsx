import { useState, useEffect } from "react";
import { useFirestore } from "../services/firestore";
import { useAuth } from "../context/useAuth";
import { Container, Flex, Grid, Heading, Spinner } from "@chakra-ui/react";
import WatchlistCard from "../components/WatchlistCard";
import PaginationComponent from "../components/PaginationComponent";

const Watchlist = () => {
  const { getWatchlist } = useFirestore();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.uid) {
      getWatchlist(user?.uid)
        .then((data) => {
          console.log(data, "data");
          setWatchlist(data);
        })
        .catch((err) => {
          console.log(err, "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user?.uid, getWatchlist]);

  const totalPages = Math.ceil((watchlist?.length || 0) / itemsPerPage);
  // Slice the watchlist based on the active page
  const paginatedWatchlist = watchlist?.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  useEffect(() => {
    if (totalPages > 0 && activePage > totalPages) {
      setActivePage(totalPages);
    } else if (totalPages === 0 && activePage !== 1) {
      setActivePage(1); // Reset back to page 1 if there’s no data
    }
  }, [watchlist, totalPages]);

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"10"}>
        <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
          Watchlist
        </Heading>
      </Flex>
      {isLoading && (
        <Flex justify={"center"} mt={"10"}>
          <Spinner size={"xl"} color="purple.500" />
        </Flex>
      )}
      {!isLoading && watchlist?.length === 0 && (
        <Flex justify={"center"} mt={"10"}>
          <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
            Watchlist is empty
          </Heading>
        </Flex>
      )}
      {!isLoading && watchlist?.length > 0 && (
        // <Grid templateColumns={{ base: "1fr" }} gap={"4"}>
        //   {watchlist?.map((item) => (
        //     <WatchlistCard
        //       key={item?.id}
        //       item={item}
        //       type={item?.type}
        //       setWatchlist={setWatchlist}
        //     />
        //   ))}
        // </Grid>
        <>
          <Grid templateColumns={{ base: "1fr" }} gap={"4"}>
            {paginatedWatchlist?.map((item) => (
              <WatchlistCard
                key={item?.id}
                item={item}
                type={item?.type}
                setWatchlist={setWatchlist}
              />
            ))}
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

export default Watchlist;
