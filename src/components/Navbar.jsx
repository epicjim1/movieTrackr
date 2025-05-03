import {
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  HamburgerIcon,
  SearchIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";

const Navbar = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { user, signInWithGoogle, logout } = useAuth();
  const { onOpen, isOpen, onClose } = useDisclosure();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log("success");
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <Box py={"4"} mb={"2"}>
      <Container maxW={"container.xl"}>
        <Flex justifyContent={"space-between"}>
          <Link to="/">
            <Box
              fontSize={"2xl"}
              fontWeight={"bold"}
              color={"purple.500"}
              letterSpacing={"widest"}
              fontFamily={"mono"}
            >
              MOVIETRACKR
            </Box>
          </Link>

          {/* <IconButton
            aria-label="toggle theme"
            rounded="full"
            onClick={toggleColorMode}
            icon={
              colorMode === "dark" ? <TriangleDownIcon /> : <TriangleUpIcon />
            }
          /> */}

          {/* Desktop */}
          <Flex
            gap={"4"}
            alignItems={"center"}
            display={{ base: "none", md: "flex" }}
          >
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/shows">TV Shows</Link>
            <Link to="/search">
              <SearchIcon fontSize={"xl"} />
            </Link>
            {user && (
              <Menu>
                <MenuButton>
                  <Avatar
                    bg={"red.500"}
                    color={"white"}
                    size={"sm"}
                    name={user?.email}
                    src={user?.photoURL}
                  />
                </MenuButton>
                <MenuList>
                  <Link to={"/account"}>
                    <MenuItem>Account</MenuItem>
                  </Link>
                  <Link to={"/watchedfilms"}>
                    <MenuItem>Watched List</MenuItem>
                  </Link>
                  <Link to={"/watchlist"}>
                    <MenuItem>Watch Later List</MenuItem>
                  </Link>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            )}
            {!user && (
              <Link to={"/authorization"}>
                {/* <Avatar
                  size={"sm"}
                  bg={"gray.800"}
                  as={"button"}
                  onClick={handleGoogleLogin}
                /> */}
                <Button>Log In / Sign up</Button>
              </Link>
            )}
          </Flex>

          {/* Mobile */}
          <Flex
            display={{ base: "flex", md: "none" }}
            alignItems={"center"}
            gap="4"
          >
            <Link to="/search">
              <SearchIcon fontSize={"xl"} />
            </Link>
            <IconButton onClick={onOpen} icon={<HamburgerIcon />} />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent bg={"black"}>
                <DrawerCloseButton />
                <DrawerHeader>
                  {user ? (
                    <Flex alignItems="center" gap="2">
                      <Avatar
                        bg="red.500"
                        size={"sm"}
                        color={"white"}
                        name={user?.email}
                        src={user?.photoURL}
                      />
                      <Box fontSize={"sm"}>
                        {user?.displayName || user?.email}
                      </Box>
                    </Flex>
                  ) : (
                    // <Avatar
                    //   size={"sm"}
                    //   bg="gray.800"
                    //   as="button"
                    //   onClick={handleGoogleLogin}
                    // />
                    <Link to={"/authorization"}>
                      <Button onClick={onClose}>Log In / Sign up</Button>
                    </Link>
                  )}
                </DrawerHeader>

                <DrawerBody>
                  <Flex flexDirection={"column"} gap={"4"} onClick={onClose}>
                    {user && <Link to={"/account"}>Account</Link>}
                    <Link to="/">Home</Link>
                    <Link to="/movies">Movies</Link>
                    <Link to="/shows">TV Shows</Link>
                    {user && (
                      <>
                        <Link to="/watchedfilms">Watched List</Link>
                        <Link to="/watchlist">Watch Later List</Link>
                        <Button
                          variant={"outline"}
                          colorScheme="red"
                          onClick={logout}
                        >
                          Logout
                        </Button>
                      </>
                    )}
                  </Flex>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
