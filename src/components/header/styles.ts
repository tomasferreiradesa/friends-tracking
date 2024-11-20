import { Box, styled } from "@mui/material";

export const HeaderWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 30px;
  background-color: lightblue;
`;

export const NavList = styled(Box)`
  display: flex;
  gap: 20px;
`;

export const NavItemLink = styled("a")`
  text-decoration: none;
  color: black;
`;
