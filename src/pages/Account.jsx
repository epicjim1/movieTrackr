import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
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
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import { useFirestore } from "../services/firestore";

const Account = () => {
  const { handleIllegalModeChange, getIllegalMode } = useFirestore();
  const { user } = useAuth();
  const [show, setShow] = React.useState(false);
  const [illegalMode, setIllegalMode] = useState(false);

  const toast = useToast();

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  const handleSave = () => {
    // Simulate save action
    toast({
      title: "Profile updated.",
      description: "Your changes have been saved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
                      value={isGoogleUser ? user?.displayName : ""}
                      isDisabled={isGoogleUser}
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
                      AdGaurd Website
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
