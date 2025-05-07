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
  useToast,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateProfile } from "firebase/auth";

const AuthPage = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log("success");
      navigate("/");
    } catch (err) {
      console.log("error", err);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        isClosable: true,
      });
      return;
    }

    try {
      await signUpWithEmail(email, password);
      const user = userCredential.user;

      // ✅ Set displayName
      await updateProfile(user, {
        displayName: username,
      });

      toast({
        title: "Account created",
        status: "success",
        isClosable: true,
      });
      navigate("/");
      // Optional: store username in Firestore if you want
      // await setDoc(doc(db, "users", user.uid), { username }, { merge: true });
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: err.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmail(email, password);
      console.log("Logged in with email");
      toast({
        title: "Login successful.",
        status: "success",
        isClosable: true,
      });
      navigate("/");
    } catch (error) {
      console.error("Login failed", error.message);
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        isClosable: true,
      });
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
          // maxH={"427px"}
          mt={{ base: "20px", md: "100px" }}
        >
          <Tabs
            isFitted
            variant="line"
            colorScheme="purple"
            onChange={() => {
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <TabList mb="4">
              <Tab>Log In</Tab>
              <Tab>Sign Up</Tab>
            </TabList>

            <TabPanels>
              {/* Log In */}
              <TabPanel>
                <VStack spacing={7} align="stretch">
                  <Heading size="md" textAlign="center" color="white">
                    Welcome back
                  </Heading>
                  <Input
                    placeholder="Email"
                    variant={"flushed"}
                    type="email"
                    focusBorderColor="purple.500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    colorScheme="purple"
                    w="full"
                    onClick={handleEmailLogin}
                  >
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
                    Create an account
                  </Heading>
                  <Input
                    placeholder="Username"
                    variant={"flushed"}
                    type="text"
                    focusBorderColor="purple.500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Email"
                    variant={"flushed"}
                    type="email"
                    focusBorderColor="purple.500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Confirm Password"
                    variant={"flushed"}
                    type="password"
                    focusBorderColor="purple.500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button colorScheme="purple" w="full" onClick={handleSignUp}>
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
