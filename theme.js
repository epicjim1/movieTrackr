import { extendTheme, Select } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode(
        //"#FFF",
        props.theme.semanticTokens.colors["chakra-body-bg"]._light,
        "blackAlpha.900"
      )(props),
    },
  }),
};

const theme = extendTheme({ config, styles, components: { Select } });

export default theme;
