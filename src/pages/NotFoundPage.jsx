import { Text, Flex } from "@chakra-ui/react";

const NotFoundPage = () => {
  return (
    <Flex
      height="90vh"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      // bg="gray.50"
      p="4"
    >
      <Text
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="bold"
        color="gray.700"
        textAlign="center"
      >
        404 - Page Not Found
      </Text>
      <Text
        fontSize={{ base: "md", md: "lg" }}
        color="gray.500"
        mt="4"
        textAlign="center"
      >
        Sorry, the page you are looking for does not exist.
      </Text>
    </Flex>
  );
};

export default NotFoundPage;
