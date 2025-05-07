import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Switch,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBreakpointValue,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import { useFirestore } from "../services/firestore";
import { updateProfile } from "firebase/auth";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const Account = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { handleIllegalModeChange, getIllegalMode } = useFirestore();
  const { user } = useAuth();
  const [show, setShow] = React.useState(false);
  const [illegalMode, setIllegalMode] = useState(false);
  const [username, setUsername] = useState(user?.displayName || "");

  const toast = useToast();

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  const handleSave = async () => {
    try {
      await updateProfile(user, {
        displayName: username, // or `username` depending on your state variable
      });

      toast({
        title: "Profile updated.",
        description: "Your changes have been saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description: err.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const orientation = useBreakpointValue(
    {
      base: "horizontal",
      md: "vertical",
    },
    {
      fallback: "md",
    }
  );

  useEffect(() => {
    const loadIllegalMode = async () => {
      if (user?.uid) {
        const value = await getIllegalMode(user.uid);
        setIllegalMode(value);
      }
    };
    loadIllegalMode();
  }, [user?.uid]);

  return (
    <Container maxW={"container.xl"}>
      <Flex justifyContent={"center"}>
        <Box
          rounded="lg"
          shadow="xl"
          w="full"
          h={"600px"}
          mt={{ base: "5", md: "10" }}
        >
          <Tabs
            orientation={orientation}
            align="start"
            colorScheme="purple"
            // variant={"unstyled"}
            h={"full"}
          >
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Settings</Tab>
            </TabList>
            {/* <TabIndicator
            mr="-1.5px"
            width="2px"
            bg="purple.500"
            borderRadius="1px"
          /> */}
            <TabPanels>
              <TabPanel>
                <Flex direction="column" align="center" mb={6}>
                  <Avatar
                    size="2xl"
                    bg={"red.500"}
                    color={"white"}
                    name={user?.email}
                    src={user?.photoURL}
                    mb={4}
                  />
                  <Heading size="md">My Account</Heading>
                </Flex>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      // value={user?.displayName}
                      focusBorderColor="purple.500"
                      isDisabled={isGoogleUser}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      // onChange={(e) => setName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={user?.email}
                      isDisabled
                      // onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={show ? "text" : "password"}
                        value={
                          isGoogleUser ? "Unkown - Through Google" : "temp"
                        }
                        isDisabled
                        // onChange={}
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShow(!show)}
                        >
                          {show ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <Button colorScheme="purple" onClick={handleSave}>
                    Save Changes
                  </Button>
                </Stack>
              </TabPanel>
              <TabPanel>
                <Flex direction={"column"} alignItems={"center"} gap={"7"}>
                  <FormControl
                    display="flex"
                    alignItems="center"
                    justifyContent={"center"}
                    // bg={"red"}
                  >
                    <FormLabel htmlFor="theme-btn" mb="0">
                      Light/Dark mode:
                    </FormLabel>
                    <IconButton
                      aria-label="toggle theme"
                      onClick={toggleColorMode}
                      icon={colorMode === "dark" ? <MoonIcon /> : <SunIcon />}
                    />
                  </FormControl>
                  <FormControl
                    display="flex"
                    alignItems="center"
                    justifyContent={"center"}
                    // bg={"red"}
                  >
                    <FormLabel htmlFor="exp-mode" mb="0">
                      ILLEGAL MODE (Ad blocker highly recommended):
                    </FormLabel>
                    <Switch
                      isChecked={illegalMode}
                      onChange={(e) => {
                        setIllegalMode(e.target.checked);
                        handleIllegalModeChange(e, user?.uid);
                      }}
                      id="exp-mode"
                      colorScheme="red"
                      size={"lg"}
                    />
                  </FormControl>
                  <Link
                    to={"https://adguard.com/en/welcome.html"}
                    target="_blank"
                  >
                    <Button colorScheme="green" size="lg">
                      AdGuard Website (for browser)
                    </Button>
                  </Link>
                  <Link to={"https://1blocker.com/"} target="_blank">
                    <Button colorScheme="green" size="lg">
                      IBlocker Website (for iphone)
                    </Button>
                  </Link>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Container>
  );
};

export default Account;
