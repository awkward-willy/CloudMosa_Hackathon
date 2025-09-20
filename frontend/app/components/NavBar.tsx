'use client';

import { Box, Button, Drawer, Flex, IconButton, Portal, Text } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';

import NextLink from 'next/link';
import { useRef } from 'react';
import { FaBars } from 'react-icons/fa6';

import { useNavigation } from './NavigationContext';
import { menuItems } from './routes';

export default function NavBar() {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { isNavOpen, openNav, closeNav, selectedIndex } = useNavigation();

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
          <Drawer.Root
            placement="start"
            open={isNavOpen}
            onOpenChange={(details) => {
              if (details.open) openNav();
              else closeNav();
            }}
          >
            <Drawer.Trigger asChild>
              <IconButton ref={triggerRef} aria-label="Open menu" variant="ghost" color="white" fontSize="20px" mr={2}>
                <FaBars />
              </IconButton>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content bg="green.600">
                  <Drawer.Body p={0}>
                    <Box>
                      {menuItems.map((item, idx) => (
                        <Box key={item.label} mb={3}>
                          <Button w="100%" borderRadius="0" color="white" bg={idx === selectedIndex ? 'green.700' : 'none'} _focus={{ boxShadow: 'none', outline: 'none' }}>
                            <ChakraLink asChild fontSize="lg">
                              <NextLink href={item.url}>{item.label}</NextLink>
                            </ChakraLink>
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Drawer.Body>
                  <Drawer.CloseTrigger asChild></Drawer.CloseTrigger>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
          <ChakraLink asChild>
            <NextLink href="/">
              <Text fontSize="16px" fontWeight="bold" color="white">
                CoinMind
              </Text>
            </NextLink>
          </ChakraLink>
        </Flex>
      </Box>
    </>
  );
}