"use client";

import { Box, Flex, IconButton, Text, Drawer, Portal, Button } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa6";
import { useRef } from "react";

export default function NavBar() {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

    const menuItems = [
    { label: "Expense Tracker", action: () => alert("Go to Expense Tracker") },
    { label: "Financial Analysis", action: () => alert("Go to Financial Analysis") },
    { label: "Currency Converter", action: () => alert("Go to Currency Converter") },
    { label: "Investment Calculator", action: () => alert("Go to Investment Calculator") },
    { label: "Financial Tips", action: () => alert("Go to Financial Tips") },
    { label: "About", action: () => alert("Go to About") },
  ];

  return (
    <>
      <Box
        as="nav"
        position="fixed"
        top="0"
        left="0"
        w="100%"
        h="40px"
        bg="green.600"
        color="white"
        zIndex="1000"
        boxShadow="md"
      >
        <Flex align="center" h="100%" px={2}>
          <Drawer.Root placement="start">
            <Drawer.Trigger asChild>
              <IconButton
                ref={triggerRef}
                aria-label="Open menu"
                variant="ghost"
                color="white"
                fontSize="20px"
                mr={2}
              >
                <FaBars />
              </IconButton>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content bg="green.600">
                  <Drawer.Header/>
                  <Drawer.Body>
                    <Box>
                        {menuItems.map((item) => (
                        <Box key={item.label} mb={2}>
                            <Button color="white" bg="none">
                            {item.label}
                            </Button>
                        </Box>
                        ))}
                    </Box>
                  </Drawer.Body>
                  <Drawer.Footer />
                  <Drawer.CloseTrigger asChild>
                  </Drawer.CloseTrigger>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>

          <Text fontSize="16px" fontWeight="bold">
            My Finance App
          </Text>
        </Flex>
      </Box>
    </>
  );
}
