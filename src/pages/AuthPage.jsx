import {
  Box,
  Button,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Heading,
  Divider,
  Container,
  Flex,
  Text,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log("success");
      navigate("/");
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    // <Box
    //   minH="100vh"
    //   display="flex"
    //   alignItems="center"
    //   justifyContent="center"
    //   bg="gray.900"
    //   px={4}
    // >
    <Container maxW={"container.xl"} h={"600px"}>
      <Flex justifyContent={"center"}>
        <Box
          // bg="gray.800"
          p={8}
          rounded="lg"
          shadow="xl"
          w="full"
          maxW="400px"
          maxH={"427px"}
          mt={{ base: "50px", md: "100px" }}
        >
          <Tabs isFitted variant="line" colorScheme="purple">
            <TabList mb="4">
              <Tab>Log In</Tab>
              <Tab>Sign Up</Tab>
            </TabList>

            <TabPanels>
              {/* Log In */}
              <TabPanel>
                <VStack spacing={7} align="stretch">
                  <Heading size="md" textAlign="center" color="white">
                    Welcome back (ONLY GOOGLE WORKS)
                  </Heading>
                  <Input
                    placeholder="Email"
                    variant={"flushed"}
                    type="email"
                    focusBorderColor="purple.500"
                  />
                  <Input
                    placeholder="Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                  />
                  <Button colorScheme="purple" w="full">
                    Log In
                  </Button>
                  <Flex my={"2px"} align={"center"}>
                    <Divider />
                    <Text mx="2" color="gray.400">
                      or
                    </Text>
                    <Divider />
                  </Flex>
                  <Button
                    leftIcon={<FcGoogle />}
                    variant="outline"
                    w="full"
                    // bg="white"
                    onClick={handleGoogleLogin}
                  >
                    Continue with Google
                  </Button>
                </VStack>
              </TabPanel>

              {/* Sign Up */}
              <TabPanel>
                <VStack spacing={7} align="stretch">
                  <Heading size="md" textAlign="center" color="white">
                    Create an account (ONLY GOOGLE WORKS)
                  </Heading>
                  <Input
                    placeholder="Email"
                    variant={"flushed"}
                    type="email"
                    focusBorderColor="purple.500"
                  />
                  <Input
                    placeholder="Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                  />
                  <Input
                    placeholder="Confirm Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                  />
                  <Button colorScheme="purple" w="full">
                    Sign Up
                  </Button>
                  <Flex my={"2px"} align={"center"}>
                    <Divider />
                    <Text mx="2" color="gray.400">
                      or
                    </Text>
                    <Divider />
                  </Flex>
                  <Button
                    leftIcon={<FcGoogle />}
                    variant="outline"
                    w="full"
                    // bg="white"
                    onClick={handleGoogleLogin}
                  >
                    Continue with Google
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Container>
  );
};

export default AuthPage;
