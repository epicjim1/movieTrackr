import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Skeleton,
} from "@chakra-ui/react";
import { fetchTrending } from "../services/api";
import CardComponent from "../components/CardComponent";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setloading] = useState(true);
  const [timeWindow, setTimeWindow] = useState("day");

  useEffect(() => {
    setloading(true);
    fetchTrending(timeWindow)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.log(err, "err");
      })
      .finally(() => {
        setloading(false);
      });
  }, [timeWindow]);

  console.log(data, "data");

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"7"}>
        <Heading as={"h2"} fontSize={"md"} textTransform={"uppercase"}>
          Trending
        </Heading>
        <Flex
          alignItems={"center"}
          gap={"2"}
          border={"1px solid teal"}
          borderColor={"purple.400"}
          borderRadius={"20px"}
        >
          <Box
            as="button"
            px={"3"}
            py={"1"}
            borderRadius={"20px"}
            bg={`${timeWindow === "day" ? "purple.500" : ""}`}
            onClick={() => setTimeWindow("day")}
          >
            Today
          </Box>
          <Box
            as="button"
            px={"3"}
            py={"1"}
            borderRadius={"20px"}
            bg={`${timeWindow === "week" ? "purple.500" : ""}`}
            onClick={() => setTimeWindow("week")}
          >
            This Week
          </Box>
        </Flex>
      </Flex>
      {/* {loading && <div>Loading...</div>} */}
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)", //"1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={"4"}
      >
        {/* {data &&
          data?.map((item, i) =>
            loading ? (
              <Skeleton height={"355"} key={i} />
            ) : (
              <CardComponent
                key={item?.id}
                item={item}
                type={item?.media_type}
              />
            )
          )} */}
        {loading
          ? Array.from({ length: 20 }).map((_, i) => (
              <Skeleton height={{ base: "256px", md: "355px" }} key={i} />
            ))
          : data?.map((item) => (
              <CardComponent
                key={item?.id}
                item={item}
                type={item?.media_type}
              />
            ))}
      </Grid>
    </Container>
  );
};

export default Home;

{
  /* <section className="py-6">
  <div className="container">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Featured Games</h2>
      <Link href="/games/featured" className="text-sm text-primary hover:underline">
        View All
      </Link>
    </div>
  </div>
  <div className="relative">
    <div className="flex space-x-4 overflow-x-auto pb-6 px-6 scrollbar-hide snap-x snap-mandatory">
      {featuredGames.map((game) => (
        <div key={game.id} className="flex-none w-[180px] md:w-[200px] snap-start">
          <GameCard game={game} />
        </div>
      ))}
    </div>
  </div>
</section> */
}
