import { Box, InlineStack, Link, Text } from '@shopify/polaris'
import { Image } from "@unpic/react"
import React from 'react'

function Footer() {
  return (
    <div style={{ }}>
      <Box paddingBlockStart="300" >
        <InlineStack align='space-between' blockAlign='center'>
            <Link url='/app'>
                <Image src='/assets/imgs/logo.png' width={120} height={40} alt='Logo'/>
            </Link>
        <InlineStack gap='100' align='space-between' blockAlign='center'>
            <Text as="p" variant="bodyMd" fontWeight="regular">
                Copyright © {new Date().getFullYear()}
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="semibold">
                | by ZionWare
            </Text>
        </InlineStack>
        </InlineStack>
      </Box>
    </div>
  )
}

export default Footer
